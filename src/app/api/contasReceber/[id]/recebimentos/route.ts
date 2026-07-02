import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        const recebimentos = await prisma.recebimento.findMany({
            where: {
                contaReceberId: id,
            },
            orderBy: {
                dataRecebimento: "asc",
            }
        });

        return NextResponse.json(recebimentos);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar os pagamentos do título!" },
            { status: 500 }
        )
    }
}

//Registrar um Recebimento do Título
export async function POST(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const tituloExiste = await prisma.contaReceber.findFirst({
            where: {
                id,
                status: {
                    notIn: ["CANCELADO", "RECEBIDO"]
                }
            }
        });

        if (!tituloExiste) {
            return NextResponse.json(
                { error: "Título não encontrad, cancelado ou já recebido" },
                { status: 400 }
            )
        }

        const recebimento = await prisma.recebimento.create({
            data: {
                contaReceberId: id,
                dataRecebimento: body.dataRecebimento,
                valorRecebido: body.valorRecebido,
                valorJuros: body.valorJuros || 0,
                valorMulta: body.valorMulta || 0,
                valorDesconto: body.valorDesconto || 0,
                formaRecebimento: body.formaRecebimento,
                contaBancoId: body.contaBancoId || null,
                comprovanteUrl: body.comprovanteUrl || null,
                numeroReferencia: body.numeroReferencia || null,
                observacoes: body.observacoes || null
            }
        })

        return NextResponse.json(recebimento, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao registrar o Recebimento!" },
            { status: 500 }
        )
    }
}