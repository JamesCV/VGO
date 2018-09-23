export interface ErrorMetadata {
    type: String;
    subtype: String;
    className: String;
    description: String;
    objectId: String;
    uncaught: Boolean;
}
export default class NotifyInspector {
    static catchAllDebugger(): Boolean | void;
}
