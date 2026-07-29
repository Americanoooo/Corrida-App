declare global {
    namespace Express {
        interface Request{
            usuario_id?: number;
        }
    }
}
export {}