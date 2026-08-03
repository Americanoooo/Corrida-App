export function calcularCustoKm(custo:number, intervaloKm:number):number{
    if(intervaloKm <=0 ){
        throw new Error("Km inválido")
    }
    if(custo <=0){
        throw new Error("Custo inválido")
    }
    
    return  custo / intervaloKm
     
}