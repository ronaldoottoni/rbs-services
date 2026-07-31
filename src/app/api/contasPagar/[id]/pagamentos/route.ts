import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET } from "../route";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar todos os pagamentos de um título
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const pagamentos = await prisma.pagamento.findMany({
            where: {
                contaPagarId: id,
            },
            orderBy: {
                dataPagamento: "asc"
            }
        });

        return NextResponse.json(pagamentos);

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao localizar os pagamentos do título!" },
            { status: 500 }
        )
    }

}

//Gerar o pagamento de um título
export async function POST(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const tituloExiste = await prisma.contaPagar.findFirst({
            where: {
                id,
                status: {
                    notIn: ["CANCELADO", "RECEBIDO"]
                }
            }
        });

        if (!tituloExiste) {
            return NextResponse.json(
                { error: "Título não encontrado, canceladou ou já recebido" },
                { status: 400 }
            )
        };

        if (!body.formaPagamento) {
            return NextResponse.json(
                { error: "Forma de pagamento é obrigatório!" },
                { status: 400 }
            );
        }

        if (!body.valorPago || Number(body.valorPago) <= 0) {
            return NextResponse.json(
                { error: "Valor pago deve ser maior que zero!" },
                { status: 400 }
            );
        }

        const resultado = await prisma.$transaction(async (tx) =>{
            const pagamento = await tx.pagamento.create({
                data:{
                    contaPagarId: id,
                    dataPagamento: body.dataPagamento,
                    valorPago: body.valorPago,
                    valorJuros: body.valorJuros || 0,
                    valorMulta: body.valorMulta || 0,
                    valorDesconto: body.valorDesconto || 0,
                    formaPagamento: body.formaPagamento
                }
            })
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao gerar o pagamento do título" },
            { status: 500 }
        )
    }
}
