import { Example } from "./example";

export class Problem{
    constructor(public body: String, public examples: Example[], public constraints: String[] | null){};
}