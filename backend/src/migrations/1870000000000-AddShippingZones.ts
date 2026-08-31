import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddShippingZones1870000000000 implements MigrationInterface {
  name = 'AddShippingZones1870000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shipping_zones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar' },
          { name: 'carrier', type: 'varchar', default: "''" },
          { name: 'countryCodes', type: 'jsonb', default: "'[]'" },
          { name: 'basePrice', type: 'numeric', precision: 10, scale: 2, default: '0' },
          { name: 'freeThreshold', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'estimatedDaysMin', type: 'int', default: '2' },
          { name: 'estimatedDaysMax', type: 'int', default: '7' },
          { name: 'sortOrder', type: 'int', default: '99' },
          { name: 'active', type: 'boolean', default: 'true' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Zones initiales
    await queryRunner.query(`
      INSERT INTO shipping_zones (id, name, carrier, "countryCodes", "basePrice", "freeThreshold", "estimatedDaysMin", "estimatedDaysMax", "sortOrder", active)
      VALUES
        (uuid_generate_v4(), 'France', 'Colissimo', '["FR","GP","MQ","GF","RE","PM","YT","NC","PF","WF","BL","MF"]'::jsonb, 6.00, 100.00, 2, 3, 1, true),
        (uuid_generate_v4(), 'Europe', 'Colissimo International', '["DE","BE","NL","LU","IT","ES","PT","AT","CH","SE","NO","DK","FI","IE","GR","PL","CZ","SK","HU","RO","BG","HR","SI","EE","LV","LT","GB","MT","CY"]'::jsonb, 12.00, 150.00, 3, 5, 2, true),
        (uuid_generate_v4(), 'Amériques', 'DHL Express', '["US","CA","MX","BR","AR","CL","CO","PE","VE","UY","BO","EC","PY","GY","SR","JM","CU","HT","DO","PR","TT","BB","LC","VC","GD","AG","KN","BS","BZ","GT","HN","SV","NI","CR","PA"]'::jsonb, 35.00, 300.00, 3, 5, 3, true),
        (uuid_generate_v4(), 'Afrique', 'DHL Express', '["NG","ZA","EG","KE","MA","TN","DZ","ET","GH","TZ","CI","SN","CM","UG","MZ","MG","BF","ML","NE","TD","SO","AO","ZM","ZW","BJ","TG","RW","MW","BI","ER","GA","CG","CD","LR","SL","GN","GW","GM","MU","CV","ST","KM","SC","DJ","SS","CF","GQ"]'::jsonb, 40.00, 400.00, 5, 8, 4, true),
        (uuid_generate_v4(), 'Asie & Océanie', 'DHL Express', '["CN","JP","KR","IN","TH","VN","SG","MY","ID","PH","HK","TW","PK","BD","LK","NP","MM","KH","LA","AU","NZ","AE","SA","QA","KW","BH","OM","JO","LB","IL","TR","IR","IQ","SY","YE","AF","UZ","KZ","AZ","GE","AM"]'::jsonb, 45.00, 400.00, 5, 8, 5, true),
        (uuid_generate_v4(), 'Reste du monde', 'DHL Express', '[]'::jsonb, 50.00, null, 7, 14, 99, true)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shipping_zones');
  }
}
