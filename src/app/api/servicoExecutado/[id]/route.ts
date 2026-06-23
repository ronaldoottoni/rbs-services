import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar Serviço específico realizado na área de um Projeto
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const servicoExecutado = await prisma.servicoExecutado.findUnique({
            where: {
                id,
            },
            include: {
                projetoArea: {
                    include: {
                        projeto: {
                            include: {
                                cliente: true
                            },
                        },
                        areaPropriedade: true,
                    },
                },
            },
        });

        if (!servicoExecutado) {
            return NextResponse.json(
                { error: "Serviço executado não foi localizado!" },
                { status: 404 }
            )
        }

        return NextResponse.json(servicoExecutado);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar o serviço executado" },
            { status: 500 }
        )
    }
}

//Atualizar um serviço executado
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const servicoExecutadoExistente = await prisma.servicoExecutado.findUnique({
            where: {
                id,
            }
        });

        if (!servicoExecutadoExistente) {
            return NextResponse.json(
                { error: "Serviço não cadastrado na área" },
                { status: 404 }
            )
        };

        const servicoExecutado = await prisma.servicoExecutado.update({
            where: {
                id,
            },
            data: {
                dataExecucao: body.dataExecucao ? new Date(body.dataExecucao) : undefined,
                areaExecutadaHa: body.areaExecutadaHa,
                produtoAplicado: body.produtoAplicado,
                doseAplicada: body.doseAplicada,
                valorExecutado: body.valorExecutado,
                observacoes: body.observacoes
            }
        });

        return NextResponse.json(servicoExecutado);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar um serviço executado" },
            { status: 500 }
        )
    }
}

//Deletar serviço executado em uma área de projeto
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const servicoExecutadoExistente = await prisma.servicoExecutado.findUnique({
            where: {
                id,
            }
        });

        if (!servicoExecutadoExistente) {
            return NextResponse.json(
                { error: "Serviço não cadastrado na área" },
                { status: 404 }
            )
        };

        const servicoArea = await prisma.servicoExecutado.delete({
            where: {
                id,
            }
        });

        return NextResponse.json(
            { 
                message: "Serviço executado excluído com sucesso!",
                servicoArea
            }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao deletar o serviço executado" },
            { status: 500 }
        )
    }
}