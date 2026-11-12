export function dataLocalISO(d = new Date()) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

// Recebe "YYYY-MM-DD" (como o backend devolve, com dateStrings: true) e
// formata pra "DD/MM/YYYY" sem passar por Date/fuso — evita o dia "voltar"
// quando o fuso do navegador fica atrás do fuso usado para salvar a data.
export function formatarDataISO(dataISO: string) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}
