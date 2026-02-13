import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function csvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '""';
  }

  if (typeof value === 'boolean') {
    return value ? '"true"' : '"false"';
  }

  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function toCsv(headers, rows) {
  const headerLine = headers.map((key) => csvCell(key)).join(',');
  const lines = rows.map((row) => headers.map((key) => csvCell(row[key])).join(','));
  return `${headerLine}\n${lines.join('\n')}\n`;
}

function normalizePack(pack) {
  const quests = [];
  const nodes = [];
  const choices = [];
  const effects = [];
  const scoringRules = [];
  const outcomeBands = [];

  for (const quest of pack.quests) {
    quests.push({
      quest_id: quest.quest_id,
      order: quest.order,
      title: quest.title,
      beat_json: JSON.stringify(quest.beat ?? [])
    });

    for (const node of quest.nodes ?? []) {
      nodes.push({
        quest_id: quest.quest_id,
        node_id: node.node_id,
        prompt: node.prompt,
        choice_count: node.choices?.length ?? 0
      });

      for (const choice of node.choices ?? []) {
        choices.push({
          quest_id: quest.quest_id,
          node_id: node.node_id,
          choice_id: choice.choice_id,
          text: choice.text,
          condition: choice.condition ?? '',
          costs_json: JSON.stringify(choice.costs ?? []),
          set_flags_json: JSON.stringify(choice.set_flags ?? {}),
          notes: choice.notes ?? ''
        });

        for (const effect of choice.effects ?? []) {
          effects.push({
            quest_id: quest.quest_id,
            node_id: node.node_id,
            choice_id: choice.choice_id,
            target: effect.target,
            op: effect.op,
            value: String(effect.value)
          });
        }
      }
    }

    for (const rule of quest.derived ?? []) {
      scoringRules.push({
        quest_id: quest.quest_id,
        rule_scope: 'derived',
        rule_id: rule.id,
        expression: rule.expression,
        notes: rule.notes ?? ''
      });
    }

    for (const rule of quest.scoring?.rules ?? []) {
      scoringRules.push({
        quest_id: quest.quest_id,
        rule_scope: 'scoring',
        rule_id: rule.id,
        expression: rule.expression,
        notes: rule.notes ?? ''
      });
    }

    for (const rule of quest.post_rules ?? []) {
      scoringRules.push({
        quest_id: quest.quest_id,
        rule_scope: 'post',
        rule_id: rule.id,
        expression: rule.expression,
        notes: rule.notes ?? ''
      });
    }

    scoringRules.push({
      quest_id: quest.quest_id,
      rule_scope: 'scoring',
      rule_id: 'final_score',
      expression: quest.scoring?.final_score ?? '',
      notes: ''
    });

    for (const band of quest.scoring?.bands ?? []) {
      outcomeBands.push({
        quest_id: quest.quest_id,
        band_min: band.min,
        band_max: band.max,
        label: band.label,
        effects_json: JSON.stringify(band.effects ?? []),
        set_flags_json: JSON.stringify(band.set_flags ?? {})
      });
    }
  }

  const meta = Object.entries(pack.meta ?? {}).map(([key, value]) => ({
    key,
    value: value === null ? '' : String(value)
  }));

  return {
    quests,
    nodes,
    choices,
    effects,
    scoringRules,
    outcomeBands,
    meta
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const packPath = args.pack;
  const outDir = args.out;

  if (!packPath || !outDir) {
    process.stderr.write('Usage: node scripts/export-pack-csv.mjs --pack <json-path> --out <out-dir>\n');
    process.exit(1);
  }

  const packRaw = await readFile(packPath, 'utf8');
  const pack = JSON.parse(packRaw);

  const { quests, nodes, choices, effects, scoringRules, outcomeBands, meta } = normalizePack(pack);

  await mkdir(outDir, { recursive: true });

  const writes = [
    {
      file: 'quests.csv',
      headers: ['quest_id', 'order', 'title', 'beat_json'],
      rows: quests
    },
    {
      file: 'nodes.csv',
      headers: ['quest_id', 'node_id', 'prompt', 'choice_count'],
      rows: nodes
    },
    {
      file: 'choices.csv',
      headers: ['quest_id', 'node_id', 'choice_id', 'text', 'condition', 'costs_json', 'set_flags_json', 'notes'],
      rows: choices
    },
    {
      file: 'effects.csv',
      headers: ['quest_id', 'node_id', 'choice_id', 'target', 'op', 'value'],
      rows: effects
    },
    {
      file: 'scoring_rules.csv',
      headers: ['quest_id', 'rule_scope', 'rule_id', 'expression', 'notes'],
      rows: scoringRules
    },
    {
      file: 'outcome_bands.csv',
      headers: ['quest_id', 'band_min', 'band_max', 'label', 'effects_json', 'set_flags_json'],
      rows: outcomeBands
    },
    {
      file: 'meta.csv',
      headers: ['key', 'value'],
      rows: meta
    }
  ];

  for (const write of writes) {
    const csv = toCsv(write.headers, write.rows);
    await writeFile(path.join(outDir, write.file), csv, 'utf8');
  }

  process.stdout.write(`Exported CSV tables to ${outDir}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
