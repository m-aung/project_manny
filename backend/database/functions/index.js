const makeTable = (tableName, columnList, tableConstraints) => {
  let colString = '';
  let tableConstraintString = '';
  const tableConstraintsList = [
    { type: 'PRIMARY KEY', value: null },
    { type: 'FOREIGN KEY', value: null },
    { type: 'REFERENCES', table: null, value: null },
  ];
  const colconstraints = {
    notNull: 'NOT NULL',
    unique: 'UNIQUE',
    primaryKey: 'PRIMARY KEY',
    check: 'CHECK',
  };
  const dataTypes = {
    serial: 'serial',
    varchar: 'VARCHAR',
    timestamp: 'TIMESTAMP',
  };

  // destructured the column list and concate it into one final string
  columnList.forEach(({ columnName, columnDataType, constraints }, idx) => {
    let constraintString = '';
    let dataTypeString = '';

    if (constraints) {
      // do constraints here
      for (const constraint in constraints) {
        constraintString += `${colconstraints[constraint]} `;
      }
    }

    if (typeof columnDataType !== 'string') {
      const { type, length } = columnDataType;
      for (const dataType in dataTypes) {
        if (type === dataTypes[dataType]) {
          dataTypeString += length ? `${type} (${length})` : `${type}`;
        }
      }
    } else {
      dataTypeString += `${columnDataType}`;
    }

    colString += ` ${columnName} ${dataTypeString} ${constraintString}${
      idx === columnList.length - 1 ? '' : ','
    }`;
  });
  if (tableConstraints) {
    // this is not an optimal loop needs to refactor
    //{ type: 'REFERENCES', table: 'accounts', value: 'user_id' }
    for (let i = 0; i < tableConstraints.length; i++) {
      for (let j = 0; j < tableConstraintsList.length; j++) {
        if (tableConstraintsList[j].type === tableConstraints[i].type)
          tableConstraintString += `${tableConstraints[i].type} ${
            tableConstraints[i].table ? tableConstraints[i].table : ''
          } (${tableConstraints[i].value}) `;
      }
    }
  }
  return `CREATE TABLE ${tableName} (
    ${colString}
    ${tableConstraintString}
  );`;
};

const exampleQuery = `
  CREATE TABLE videoes (
    video_id serial PRIMARY KEY,
    title VARCHAR ( 50 ) UNIQUE NOT NULL,
    video_link VARCHAR ( 250 ) NOT NULL,
    views INT NOT NULL,
    created_on TIMESTAMP NOT NULL,
    uploaded_on TIMESTAMP NOT NULL
);`;

const newTable = makeTable(
  'accounts',
  [
    {
      columnName: 'user_id',
      columnDataType: 'serial',
      constraints: { primaryKey: true },
    },
    {
      columnName: 'username',
      columnDataType: { type: 'VARCHAR', length: 50 },
      constraints: { unique: true, notNull: true },
    },
    {
      columnName: 'password',
      columnDataType: { type: 'VARCHAR', length: 50 },
      constraints: { notNull: true },
    },
    {
      columnName: 'email',
      columnDataType: { type: 'VARCHAR', length: 255 },
      constraints: { unique: true, notNull: true },
    },
    {
      columnName: 'created_on',
      columnDataType: { type: 'TIMESTAMP' },
      constraints: { notNull: true },
    },
    { columnName: 'last_login', columnDataType: { type: 'TIMESTAMP' } },
  ],
  [
    { type: 'FOREIGN KEY', value: 'user_id' },
    { type: 'REFERENCES', table: 'accounts', value: 'user_id' },
  ]
);
console.log(newTable);
