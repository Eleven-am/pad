import { Prisma, PrismaClient } from "@/generated/prisma";
import { TaskEither } from "@eleven-am/fp";
import { DefaultArgs } from "@prisma/client/runtime/library";

export type Transaction = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export class BaseService {
	constructor (protected readonly prisma: PrismaClient) {}
	
	/**
	 * Performs a transaction
	 * @param fn - The function to perform the transaction
	 * @param tx - The transaction to use
	 * @returns The result of the transaction
	 */
	protected performTransaction<Result>(fn: (tx: Transaction) => Promise<Result>, tx?: Transaction): TaskEither<Result> {
		return TaskEither
			.of(tx)
			.matchTask([
				{
					predicate: (tx) => tx !== undefined,
					run: (tx) => TaskEither.tryCatch(() => fn(tx!))
				},
				{
					predicate: () => true,
					run: () => TaskEither.tryCatch(() => this.prisma.$transaction(fn))
				}
			]);
	}
	
	/**
	 * Performs a transaction with a TaskEither function
	 * @param fn - The function to perform the transaction
	 * @param tx - The transaction to use
	 * @returns The result of the transaction
	 */
	protected performTransactionTask<Result>(fn: (tx: Transaction) => TaskEither<Result>, tx?: Transaction): TaskEither<Result> {
		if (tx) {
			return fn(tx);
		} else {
			return TaskEither.tryCatch(() => this.prisma.$transaction((tx) => fn(tx).toPromise()))
		}
	}
}