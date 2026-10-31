// Padrão de nome das branches de trabalho definido em policies/features.md.
const workBranchPattern = /^(feature|fix|refactor|test|ci|chore|docs)-[a-z0-9]+(-[a-z0-9]+)*$/;

export const WORK_BRANCH_MAX_LENGTH = 50;
export const WORK_BRANCH_RULE = "Use <tipo>-<slug> com tipo feature, fix, refactor, test, ci, chore ou docs, só minúsculas, números e hífens, até 50 caracteres (policies/features.md).";

export const isWorkBranch = (branch: string) => branch.length <= WORK_BRANCH_MAX_LENGTH && workBranchPattern.test(branch);
