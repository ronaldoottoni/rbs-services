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
