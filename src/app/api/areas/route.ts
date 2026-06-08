import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Áreas de uma propriedade
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const propriedadeId = searchParams.get("propriedadeId");

        if (!propriedadeId) {
            return NextResponse.json(
                { error: "Informe o código da Propriedade (propriedadeId)" },
                { status: 400 }
            )
        }

        const areas = await prisma.areaPropriedade.findMany({
            where: {
                propriedadeId,
                ativo: true
            },
            include: {
                propriedade: {
                    include: {
                        cliente: true
                    },
                },
            },
            orderBy: {
                nome: "asc"
            }
        })

        return NextResponse.json(areas);

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao buscar áreas" },
            { status: 500 }
        )
    }
}

//Criar áreas
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const area = await prisma.areaPropriedade.create({
            data: {
                propriedadeId: body.propriedadeId,
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

        return NextResponse.json(area, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao cadastra área" },
            { status: 500 }
        )
    }
}