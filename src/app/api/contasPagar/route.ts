import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinanceiroStatus, FormaPagamento } from "@prisma/client";
import { PrismaClientRustPanicError } from "@prisma/client/runtime/client";

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

//Criar um Contas a Pagar
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const contaPagar = await prisma.contaPagar.create({
            data: {
                fornecedorId: body.fornecedorId,
                projetoId: body.projetoId || null,
                numeroDocumento: body.numeroDocumento || null,
                descricao: body.descricao,
                competencia: body.competencia || null,
                dataEmissao: body.dataEmissao,
                dataVencimento: body.dataVencimento,
                valorOriginal: body.valorOriginal,
                valorDesconto: body.valorDesconto,
                valorJuros: body.valorJuros,
                valorMulta: body.valorMulta,
                valorPago: body.valorPago,
                valorAberto:
                    Number(body.valorOriginal || 0) +
                    Number(body.valorJuros || 0) +
                    Number(body.valorMulta || 0) -
                    Number(body.valorDesconto || 0),
                formaPagamento: body.formaPagamento || null,
                categoria: body.categoria || null,
                observacoes: body.observacoes || null,
            }
        });

        return NextResponse.json(contaPagar, { status: 201 })

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao criar o Contas a Pagar!" },
            { status: 500 }
        )
    }
}