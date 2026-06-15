import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar Area especifica do projeto
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const area = await prisma.projetoArea.findUnique({
            where: {
                id,
            },
            include: {
                projeto: {
                    include: {
                        cliente: true,
                        propriedade: true,
                        servicoCatalogo: true,
                    }
                },
                areaPropriedade: {
                    include: {
                        propriedade: {
                            include: {
                                cliente: true,
                            },
                        },
                    },
                },
            },
        });

        if (!area) {
            return NextResponse.json(
                { error: "Área não encontrada!" },
                { status: 404 }
            )
        }

        return NextResponse.json(area);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar área do Projeto" },
            { status: 500 }
        )
    }
}

//Atualizar projetoArea
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const projAreaExistente = await prisma.projetoArea.findUnique({
            where: {
                id,
            },
        });

        if (!projAreaExistente) {
            return NextResponse.json(
                { error: "Área do projeto não Cadastrada" },
                { status: 404 }
            )
        };

        const projetoArea = await prisma.projetoArea.update({
            where: {
                id,
            },
            data: {
                observacoes: body.observacoes
            }
        });

        return NextResponse.json(projetoArea);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar a área do projeto" },
            { status: 500 }
        )
    }
}

// Deletar/Inativar uma Área
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;
        
        const areaExistente = await prisma.projetoArea.findUnique({
            where: {
                id,
            },
        });

        if (!areaExistente) {
            return NextResponse.json(
                { error: "Área não encontrada!" },
                { status: 404 }
            )
        }

        const projetoArea  = await prisma.projetoArea.delete({
            where: {
                id,
            },
        })

        return NextResponse.json(
            {
                message: "Área excluída do projeto com sucesso!", 
                projetoArea 
            }
        )

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao deletar a área do projeto" },
            { status: 500 }
        )
    }
}