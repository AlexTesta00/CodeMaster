export class CodeQuestError{
    static InvalidAuthor = class extends Error{};
    static InvalidProblem = class extends Error{};
    static InvalidTitle= class extends Error{};
}