import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinanceiroStatus } from "@prisma/client";

//Listar Todo o Contas a Pagar
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const fornecedorId = searchParams.get("fornecedorId");
        const status = searchParams.get("status") as FinanceiroStatus | null;

        const projetoId = searchParams.get("projetoId");
        const vencimentoIni = searchParams.get("vencimentoIni");
        const vencimentoFin = searchParams.get("vencimentoFin");
        const flagCancelados = searchParams.get("flagCancelados");

        const contasPagar = await prisma.contaPagar.findMany({
            where: {
                ativo: true,

                ...(fornecedorId && { fornecedorId }),
                ...(status
                    ? { status }
                    : flagCancelados !== "true"
                        ? { status: { not: "CANCELADO" } }
                        : {}
                ),
                ...(projetoId && { projetoId }),
                ...(flagCancelados !== "true" && {
                    status: {
                        not: "CANCELADO"
                    }
                }),

                ...(vencimentoIni || vencimentoFin
                    ? {
                        dataVencimento: {
                            ...(vencimentoIni && {
                                gte: new Date(vencimentoIni),
                            }),
                            ...(vencimentoFin && {
                                lte: new Date(vencimentoFin),
                            }),
                        },
                    }
                    : {}),
            },
            orderBy: {
                dataVencimento: "asc"
            },
            include: {
                fornecedor: true,
                projeto: true,
                servicoExecutado: true,
                pagamento: true
            }
        })

        return NextResponse.json(contasPagar);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao listar Contas a Pagar" },
            { status: 500 }
        )
    }
}