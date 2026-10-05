import { AppError } from "./AppError";

export  function duplicateError(err:unknown, message: string) : never{
    if(err instanceof Error && (err as any).code === "ER_DUP_ENTRY"){
        throw new AppError(409, message)
    }
    console.error(err)
    throw err

}