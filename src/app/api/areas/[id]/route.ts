import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

//Listar Área específica de uma propriedade
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const area = await prisma.areaPropriedade.findUnique({
            where: {
                id,
            },
            include: {
                propriedade: {
                    include: {
                        cliente: true,
                        ativo: true
                    }
                }
            }
        })

        if (!area) {
            return NextResponse.json(
                { error: "Área não encontrada!" },
                { status: 404 }
            )
        }

        return NextResponse.json(area)

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar Área específica" },
            { status: 500 }
        )
    }
}

//Atualizar uma área
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const areaExistente = await prisma.areaPropriedade.findUnique({
            where: {
                id,
            },
        })

        if (!areaExistente) {
            return NextResponse.json(
                { error: "Área da propriedade não cadastrada" },
                { status: 404 }
            );
        }

        const area = await prisma.areaPropriedade.update({
            where: {
                id,
            },
            data: {
                nome: body.nome,
                tipo: body.tipo,
                areaHa: body.areaHa,
                culturaAtual: body.culturaAtual,
                descricao: body.descricao,
                latitudeCentro: body.latitudeCentro,
                longitudeCentro: body.longitudeCentro,
                coordenadasGeoJson: body.coordenadasGeoJson,
            }
        })

        return NextResponse.json(area);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar a área!" },
            { status: 500 }
        )
    }
}

//Deletar/Inativar uma Área
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const areaExistente = await prisma.areaPropriedade.findUnique({
            where: {
                id,
            },
        })

        if (!areaExistente) {
            return NextResponse.json(
                { error: "Área da propriedade não cadastrada" },
                { status: 404 }
            );
        }

        const area = await prisma.areaPropriedade.update({
            where: {
                id,
            },
            data: {
                ativo: false
            }
        });

        return NextResponse.json(
            {
                message: "Área inativada com sucesso",
                area
            }
        )

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao deletar área" },
            { status: 500 }
        )
    }
}