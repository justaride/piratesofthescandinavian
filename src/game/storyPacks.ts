import Ajv2020 from 'ajv/dist/2020';

import schemaJson from '../../story/schema/quest-pack.schema.json';
import act2Json from '../../story/data/act2-quest-pack.json';
import act3Json from '../../story/data/act3-quest-pack.json';
import type { PackId, QuestPack } from './types';

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schemaJson as object);

function ensureValidPack(pack: unknown, packId: string): QuestPack {
  if (!validate(pack)) {
    const errors = (validate.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message || 'invalid'}`)
      .join('; ');
    throw new Error(`Story pack ${packId} failed schema validation: ${errors}`);
  }

  return pack as QuestPack;
}

export const storyPacks: Record<PackId, QuestPack> = {
  act2: ensureValidPack(act2Json, 'act2'),
  act3: ensureValidPack(act3Json, 'act3')
};

export const packTitles: Record<PackId, string> = {
  act2: 'Act 2 - Winter Reckoning',
  act3: 'Act 3 - Spring Fracture (Scaffold)'
};
