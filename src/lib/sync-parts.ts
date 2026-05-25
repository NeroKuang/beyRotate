import { prisma } from "@/lib/prisma";
import { loadPartsDb } from "@/lib/catalog/parts-db";
import {
  buildMainBladeSearchText,
  buildPartSearchText,
  catalogPartNameZh,
} from "@/lib/catalog/part-display";
import { bitDisplayAbbr } from "@/lib/catalog/part-names-zh";
import {
  buildRatchetSearchAliases,
  ratchetDisplayZh,
} from "@/lib/catalog/ratchet-search";
import { slotLabel } from "@/lib/catalog/part-groups";

type UpsertRow = {
  partType: string;
  abbr: string;
  line: string;
  partGroup: string;
  seriesScope: string;
  nameZh: string;
  displayLabel: string;
  searchText: string;
  meta?: object;
};

async function upsertPart(row: UpsertRow) {
  await prisma.catalogPart.upsert({
    where: {
      partType_abbr_line_partGroup: {
        partType: row.partType,
        abbr: row.abbr,
        line: row.line,
        partGroup: row.partGroup,
      },
    },
    create: row,
    update: {
      seriesScope: row.seriesScope,
      nameZh: row.nameZh,
      displayLabel: row.displayLabel,
      searchText: row.searchText,
      meta: row.meta ?? {},
    },
  });
}

function partDisplayLabel(
  partType: string,
  partGroup: string,
  nameZh: string
) {
  return `${slotLabel(partType, partGroup)} · ${nameZh}`;
}

async function cleanupLegacyBladeRows() {
  await prisma.catalogPart.deleteMany({
    where: { partType: "blade", partGroup: "", line: "" },
  });
}

export async function syncCatalogParts(): Promise<number> {
  const db = await loadPartsDb();
  await cleanupLegacyBladeRows();

  let count = 0;
  const cxGroups = new Set(["chip", "over", "main", "assist", "metal", "hasbro"]);

  for (const [line, groups] of Object.entries(db.divided)) {
    if (line !== "CX") continue;
    for (const [group, symbols] of Object.entries(groups)) {
      if (!cxGroups.has(group)) continue;
      for (const [abbr, entry] of Object.entries(symbols)) {
        const nameZh = catalogPartNameZh("blade", group, abbr, entry);
        await upsertPart({
          partType: "blade",
          abbr,
          line: "CX",
          partGroup: group,
          seriesScope: "cx",
          nameZh,
          displayLabel: partDisplayLabel("blade", group, nameZh),
          searchText: buildPartSearchText("blade", group, abbr, nameZh, [
            group === "assist" ? "自由型 重型" : "",
          ]),
          meta: { ...(entry as object), line, group },
        });
        count++;
      }
    }
  }

  for (const [abbr, entry] of Object.entries(db.blade)) {
    const nameZh = catalogPartNameZh("blade", "main", abbr, entry);
    const searchExtra = buildMainBladeSearchText(abbr, entry);
    await upsertPart({
      partType: "blade",
      abbr,
      line: "",
      partGroup: "main",
      seriesScope: "bx_ux",
      nameZh,
      displayLabel: partDisplayLabel("blade", "main", nameZh),
      searchText: buildPartSearchText("blade", "main", abbr, nameZh, [
        searchExtra,
      ]),
      meta: entry as object,
    });
    count++;
  }

  for (const [abbr, entry] of Object.entries(db.ratchet)) {
    const nameZh = ratchetDisplayZh(abbr);
    const aliases = buildRatchetSearchAliases(abbr);
    await upsertPart({
      partType: "ratchet",
      abbr,
      line: "",
      partGroup: "",
      seriesScope: "all",
      nameZh,
      displayLabel: partDisplayLabel("ratchet", "", nameZh),
      searchText: [abbr, nameZh, ...aliases].join(" "),
      meta: entry as object,
    });
    count++;
  }

  for (const [abbr, entry] of Object.entries(db.bit)) {
    const label = bitDisplayAbbr(abbr) ?? abbr.toUpperCase();
    await upsertPart({
      partType: "bit",
      abbr,
      line: "",
      partGroup: "",
      seriesScope: "all",
      nameZh: label,
      displayLabel: partDisplayLabel("bit", "", label),
      searchText: [abbr, label, abbr.toUpperCase(), abbr.toLowerCase()].join(" "),
      meta: entry as object,
    });
    count++;
  }

  return count;
}
