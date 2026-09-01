import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET single article by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Try to find by ID first, then by slug
    let article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug: id },
      });
    }

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // If not admin and article is not published, deny access
    if (
      (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) &&
      article.status !== "PUBLISHED"
    ) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT update article (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
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

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // If slug changed, check if new slug is unique
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // If status changed to PUBLISHED and no publishedAt, set it now
    let newPublishedAt = publishedAt ? new Date(publishedAt) : existingArticle.publishedAt;
    if (status === "PUBLISHED" && !existingArticle.publishedAt && !publishedAt) {
      newPublishedAt = new Date();
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        slug: slug || existingArticle.slug,
        titleId: titleId || existingArticle.titleId,
        titleEn: titleEn || existingArticle.titleEn,
        contentId: contentId || existingArticle.contentId,
        contentEn: contentEn || existingArticle.contentEn,
        excerptId: excerptId !== undefined ? excerptId : existingArticle.excerptId,
        excerptEn: excerptEn !== undefined ? excerptEn : existingArticle.excerptEn,
        authorName: authorName || existingArticle.authorName,
        authorPosition: authorPosition !== undefined ? authorPosition : existingArticle.authorPosition,
        category: category || existingArticle.category,
        coverImage: coverImage !== undefined ? coverImage : existingArticle.coverImage,
        imagePosition: imagePosition || existingArticle.imagePosition,
        status: status || existingArticle.status,
        isFeatured: isFeatured !== undefined ? isFeatured : existingArticle.isFeatured,
        publishedAt: newPublishedAt,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE article (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
