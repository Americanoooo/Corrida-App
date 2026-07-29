export function formatarMoeda(valor: number | string, casas = 2){
    return Number(valor).toLocaleString('pt-BR', {
        style:'currency',
        currency:'BRL',
        minimumFractionDigits:casas,
    });
}