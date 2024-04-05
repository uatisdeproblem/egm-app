import { DynamoDB, SharedIniFileCredentials } from 'aws-sdk';

export type DDB = DynamoDB.DocumentClient;

export async function initWithSSO(profile: string, region?: string): Promise<{ ddb: DynamoDB.DocumentClient }> {
  const credentials = new SharedIniFileCredentials({ profile });
  return { ddb: new DynamoDB.DocumentClient({ region, credentials }) };
}

export async function scanInfinite(
  ddb: AWS.DynamoDB.DocumentClient,
  params: AWS.DynamoDB.DocumentClient.ScanInput,
  items: AWS.DynamoDB.DocumentClient.AttributeMap[] = []
): Promise<AWS.DynamoDB.DocumentClient.AttributeMap[]> {
  const result = await ddb.scan(params).promise();

  items = items.concat(result.Items);

  if (result.LastEvaluatedKey) {
    params.ExclusiveStartKey = result.LastEvaluatedKey;
    return await scanInfinite(ddb, params, items);
  } else return items;
}

export function chunkArray(array: any[], chunkSize: number = 100): any[][] {
  return array.reduce((resultArray, item, index): any[][] => {
    const chunkIndex = Math.floor(index / chunkSize);
    if (!resultArray[chunkIndex]) resultArray[chunkIndex] = [];
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, []);
}

export async function putItemsHelper(ddb: DDB, tableName: string, items: any[], write = false): Promise<void> {
  const writeElement = async (ddb: DDB, element: any): Promise<void> => {
    try {
      await ddb.put({ TableName: tableName, Item: element }).promise();
    } catch (error) {
      console.log(`Put failed (${tableName})`, element);
      throw error;
    }
  };

  if (!write) console.log(`${tableName} preview:`, items.slice(0, 5));
  else {
    console.log(`Writing ${tableName}`);
    const chunkSize = 100;
    const chunks = chunkArray(items, chunkSize);
    for (let i = 0; i < chunks.length; i++) {
      console.log('\tProgress:', i * chunkSize);
      await Promise.allSettled(chunks[i].map(x => writeElement(ddb, x)));
    }
  }
}
