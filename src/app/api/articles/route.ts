import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET all articles (public for published, all for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};

    // If not admin, only show published articles
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      where.status = "PUBLISHED";
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST create article (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await request.json();
    const {
      slug,
      titleId,
      titleEn,
      contentId,
      contentEn,
      excerptId,
      excerptEn,
      authorName,
      authorPosition,
      category,
      coverImage,
      imagePosition,
      status,
      isFeatured,
      publishedAt,
    } = data;

    // Validate required fields
    if (!slug || !titleId || !titleEn || !contentId || !contentEn || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        slug,
        titleId,
        titleEn,
        contentId,
        contentEn,
        excerptId: excerptId || null,
        excerptEn: excerptEn || null,
        authorName,
        authorPosition: authorPosition || null,
        category: category || "ARTICLE",
        coverImage: coverImage || null,
        imagePosition: imagePosition || "TOP",
        status: status || "DRAFT",
        isFeatured: isFeatured || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
