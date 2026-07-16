import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar todos os recebimentos de um título
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
            { error: "Erro ao localizar os recebimentos do título!" },
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
                { error: "Título não encontrado, cancelado ou já recebido" },
                { status: 400 }
            )
        }

        if (!body.formaRecebimento) {
            return NextResponse.json(
                { error: "Forma de recebimento é obrigatória!" },
                { status: 400 }
            );
        }

        if (!body.valorRecebido || Number(body.valorRecebido) <= 0) {
            return NextResponse.json(
                { error: "Valor recebido deve ser maior que zero!" },
                { status: 400 }
            );
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const recebimento = await tx.recebimento.create({
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
                    observacoes: body.observacoes || null,
                },
            });

            const totais = await tx.recebimento.aggregate({
                where: {
                    contaReceberId: id,
                    estornado: false,
                },
                _sum: {
                    valorRecebido: true,
                    valorJuros: true,
                    valorMulta: true,
                    valorDesconto: true,
                },
            });

            const valorRecebido = Number(totais._sum.valorRecebido || 0);
            const valorJuros = Number(totais._sum.valorJuros || 0);
            const valorMulta = Number(totais._sum.valorMulta || 0);
            const valorDesconto = Number(totais._sum.valorDesconto || 0);

            const valorOriginal = Number(tituloExiste.valorOriginal);

            const valorTotalTitulo =
                valorOriginal +
                valorJuros +
                valorMulta -
                valorDesconto;

            const valorAbertoCalculado = valorTotalTitulo - valorRecebido;
            const valorAberto = valorAbertoCalculado < 0 ? 0 : valorAbertoCalculado;

            let status: "ABERTO" | "PARCIALMENTE_RECEBIDO" | "RECEBIDO" = "ABERTO";

            if (valorAberto <= 0) {
                status = "RECEBIDO";
            } else if (valorRecebido > 0) {
                status = "PARCIALMENTE_RECEBIDO";
            }

            const tituloAtualizado = await tx.contaReceber.update({
                where: {
                    id,
                },
                data: {
                    valorRecebido,
                    valorJuros,
                    valorMulta,
                    valorDesconto,
                    valorAberto,
                    status,
                },
            });

            return {
                recebimento,
                tituloAtualizado,
            };
        });

        return NextResponse.json(resultado, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao registrar o Recebimento!" },
            { status: 500 }
        )
    }
}