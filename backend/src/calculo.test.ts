import { calcularCustoCombustivel, calcularCustoKm } from "./calculos"


test("Calcular custo por km", ()=> {const resultado = calcularCustoKm(300, 10000)
     expect(resultado).toBe(0.03)})


test('lança erro quando o intervalo é zero ou negativo', ()=> {expect(()=> calcularCustoKm(300,0)).toThrow("Km inválido")} )

test('lança erro quando o custo é zero ou negativo', ()=> {expect(()=> calcularCustoKm(0,300)).toThrow("Custo inválido")} )


test("Calcular custo do combustível por km", ()=> {
     const resultado = calcularCustoCombustivel(100,40,6.10)
     expect(resultado).toBe(15.25)
})