import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

//Listar Propriedade especifica
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const propriedade = await prisma.propriedade.findUnique({
            where: {
                id,
            },
            include: {
                cliente: true,
                areas: true,
            }
        });

        if (!propriedade) {
            return NextResponse.json(
                { error: "Propriedade não encontrada" },
                { status: 404 }
            )
        }
        return NextResponse.json(propriedade)
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar Propriedade " },
            { status: 500 }
        )
    }
}

//Atualizar uma propriedade
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const propriedadeExistente = await prisma.propriedade.findUnique({
            where: {
                id,
            },
        });

        if (!propriedadeExistente) {
            return NextResponse.json(
                { error: "Propriedade não encontrada" },
                { status: 404 }
            );
        }

        const propriedade = await prisma.propriedade.update({
            where: {
                id,
            },
            data: {
                nome: body.nome,
                tipo: body.tipo,
                matricula: body.matricula,
                areaTotalHa: body.areaTotalHa,
                cidade: body.cidade,
                estado: body.estado,
                endereco: body.endereco,

                latitude: body.latitude,
                longitude: body.longitude,
            }
        })

        return NextResponse.json(propriedade);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar Propriedade" },
            { status: 500 }
        )
    }
}

//Deletar/Inativar uma propriedade
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const propriedadeExistente = await prisma.propriedade.findUnique({
            where: {
                id,
            },
        });

        if (!propriedadeExistente) {
            return NextResponse.json(
                { error: "Propriedade não encontrada" },
                { status: 404 }
            );
        }

        const propriedade = await prisma.propriedade.update({
            where: {
                id,
            },
            data: {
                ativo: false
            }
        })

        return NextResponse.json(
            {
                message: "Propriedade inativada com sucesso",
                propriedade
            }
        )

    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Erro ao inativar propriedade" },
            { status: 500 }
        )
    }
}