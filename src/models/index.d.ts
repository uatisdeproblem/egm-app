import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type SessionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Session {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Session, SessionMetaData>);
  static copyOf(source: Session, mutator: (draft: MutableModel<Session, SessionMetaData>) => MutableModel<Session, SessionMetaData> | void): Session;
}