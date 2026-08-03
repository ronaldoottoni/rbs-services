import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
        pagamentoId: string;
    }>
}

//Registrar estorno de Pagamento
export async function POST(
    request: Request,
    { params }: Params
) {
    try {
        const { id, pagamentoId } = await params;

        const body = await request.json();

        if (!body.motivoEstorno) {
            return NextResponse.json(
                { error: "Informe o motivo do estorno" },
                { status: 400 }
            )
        };

        const pagamentoExiste = await prisma.pagamento.findFirst({
            where: {
                id: pagamentoId,
                contaPagarId: id
            }
        });

        if (!pagamentoExiste) {
            return NextResponse.json(
                { error: "Pagamento não localizado" },
                { status: 404 }
            )
        };

        if (pagamentoExiste.estornado) {
            return NextResponse.json(
                { error: "Pagamento já for estornado" },
                { status: 400 }
            )
        };

        const resultado = await prisma.$transaction(async (tx) => {
            const pagamentoEstornado = await tx.pagamento.update({
                where: {
                    id: pagamentoId,
                },
                data: {
                    estornado: true,
                    dataEstorno: new Date(),
                    motivoEstorno: body.moticoEstorno
                },
            });

            const titulo = await tx.contaPagar.findUnique({
                where: {
                    id,
                },
            });

            if (!titulo) {
                throw new Error("Título não encontrado");
            }

            const totais = await tx.pagamento.aggregate({
                where: {
                    contaPagarId: id,
                    estornado: false,
                },
                _sum: {
                    valorPago: true,
                    valorJuros: true,
                    valorMulta: true,
                    valorDesconto: true,
                },
            });

            const valorPago = Number(totais._sum.valorPago || 0);
            const valorJuros = Number(totais._sum.valorJuros || 0);
            const valorMulta = Number(totais._sum.valorMulta || 0);
            const valorDesconto = Number(totais._sum.valorDesconto || 0);

            const valorOriginal = Number(titulo.valorOriginal);

            const valorTotalTitulo =
                valorOriginal +
                valorJuros +
                valorMulta -
                valorDesconto;

            const valorAbertoCalculado = valorTotalTitulo - valorPago;
            const valorAberto = valorAbertoCalculado < 0 ? 0 : valorAbertoCalculado;

            let status: "ABERTO" | "PARCIALMENTE_PAGO" | "PAGO" = "ABERTO";

            if (valorAberto <= 0) {
                status = "PAGO";
            } else if (valorAberto > 0) {
                status = "PARCIALMENTE_PAGO";
            }

            const tituloAtualizado = await tx.contaPagar.update({
                where:{
                    id
                },
                data: {
                    valorPago,
                    valorJuros,
                    valorMulta,
                    valorDesconto,
                    valorAberto,
                    status,
                }
            });

            return {
                pagamentoEstornado,
                tituloAtualizado
            }
        })

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao Registrar Estorno do Pagamento!" },
            { status: 500 }
        )
    }
}
