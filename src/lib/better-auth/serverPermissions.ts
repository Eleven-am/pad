import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	post: ["create", "read", "update", "delete", "publish"],
	file: ["upload", "read", "delete"],
	analytics: ["read"],
	category: ["create", "read", "update", "delete"],
	tag: ["create", "read", "update", "delete"],
	webhook: ["create", "read", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const READER = ac.newRole({
	post: ["read"],
	file: ["read"],
});

export const AUTHOR = ac.newRole({
	post: ["create", "read", "update", "delete"],
	file: ["upload", "read", "delete"],
	category: ["read"],
	tag: ["read"],
});

export const EDITOR = ac.newRole({
	...AUTHOR.statements,
	post: ["create", "read", "update", "delete", "publish"],
	tag: ["create", "read", "update", "delete"],
	category: ["create", "read", "update", "delete"],
	analytics: ["read"],
});

export const ADMIN = ac.newRole({
	...EDITOR.statements,
	...adminAc.statements,
	webhook: ["create", "read", "update", "delete"],
});

export { ac };