CREATE TABLE IF NOT EXISTS web_analytic_event (
    id VARCHAR(36) GENERATED ALWAYS AS (json ->> 'id') STORED NOT NULL,
    name VARCHAR(256) GENERATED ALWAYS AS (json ->> 'name') STORED NOT NULL,
    fullyQualifiedName VARCHAR(256) GENERATED ALWAYS AS (json ->> 'fullyQualifiedName') STORED NOT NULL,
    eventType VARCHAR(256) GENERATED ALWAYS AS (json ->> 'eventType') STORED NOT NULL,
    json JSONB NOT NULL,
    updatedAt BIGINT GENERATED ALWAYS AS ((json ->> 'updatedAt')::bigint) STORED NOT NULL,
    updatedBy VARCHAR(256) GENERATED ALWAYS AS (json ->> 'updatedBy') STORED NOT NULL,
    deleted BOOLEAN GENERATED ALWAYS AS ((json ->> 'deleted')::boolean) STORED,
    UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS name_index ON web_analytic_event(name);

UPDATE bot_entity
SET json = JSONB_SET(json::jsonb, '{provider}', '"system"', true);

UPDATE bot_entity
SET json = json::jsonb #- '{botType}';

UPDATE role_entity
SET json = JSONB_SET(json::jsonb, '{provider}', '"system"', true)
WHERE name in ('DataConsumer', 'DataSteward');

UPDATE policy_entity
SET json = JSONB_SET(json::jsonb, '{provider}', '"system"', true)
WHERE fullyQualifiedName in ('DataConsumerPolicy', 'DataStewardPolicy', 'OrganizationPolicy', 'TeamOnlyPolicy');

UPDATE tag_category
SET json = JSONB_SET(json::jsonb, '{provider}', '"system"', true)
WHERE name in ('PersonalData', 'PII', 'Tier');

UPDATE tag
SET json = JSONB_SET(json::jsonb, '{provider}', '"system"', true)
WHERE fullyQualifiedName in ('PersonalData.Personal', 'PersonalData.SpecialCategory',
'PII.None', 'PII.NonSensitive', 'PII.Sensitive',
'Tier.Tier1', 'Tier.Tier2', 'Tier.Tier3', 'Tier.Tier4', 'Tier.Tier5');