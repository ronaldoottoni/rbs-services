import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
        recebimentoId: string;
    }>
}

//Registrar estorno de Pagamento
export async function POST(
    request: Request,
    { params }: Params
) {
    try {
        const { id, recebimentoId } = await params;

        const body = await request.json();

        if (!body.motivoEstorno) {
            return NextResponse.json(
                { error: "Informe o motivo do estorno" },
                { status: 400 }
            )
        };

        const recebimentoExiste = await prisma.recebimento.findFirst({
            where: {
                id: recebimentoId,
                contaReceberId: id
            }
        });

        if (!recebimentoExiste) {
            return NextResponse.json(
                { error: "Recebimento não localizado" },
                { status: 400 }
            )
        };
        if (recebimentoExiste.estornado) {
            return NextResponse.json(
                { error: "Recebimento já foi estornado!" },
                { status: 400 }
            )
        };
        
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao registrar o estorno do pagamento!" },
            { status: 500 }
        )
    }
}