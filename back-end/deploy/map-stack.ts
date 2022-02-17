import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as Location from 'aws-cdk-lib/aws-location';

export interface MapProps extends cdk.StackProps {
  project: string;
}

export class MapStack extends cdk.Stack {
  public readonly map: Location.CfnMap;

  constructor(scope: Construct, id: string, props: MapProps) {
    super(scope, id, props);

    this.map = new Location.CfnMap(this, 'Map', {
      mapName: `${props.project}-map`,
      configuration: { style: 'VectorEsriLightGrayCanvas' }
    });
  }
}
