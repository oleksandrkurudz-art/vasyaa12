import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../src/lib/categories";
import { COMMUNITIES } from "../src/lib/communities";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Допоміжне: картинка-заглушка зі стабільним сидом.
const img = (seed: string, w = 800, h = 450) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("Seeding…");

  // Очистка (порядок через FK).
  await prisma.ad.deleteMany();
  await prisma.advertiser.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.community.deleteMany();

  // 1) Розділи
  const categories: Record<string, number> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const created = await prisma.category.create({
      data: { slug: c.slug, name: c.name, order: i },
    });
    categories[c.slug] = created.id;
  }

  // 1b) Громади
  const communities: Record<string, number> = {};
  for (let i = 0; i < COMMUNITIES.length; i++) {
    const c = COMMUNITIES[i];
    const created = await prisma.community.create({
      data: { slug: c.slug, name: c.name, order: i },
    });
    communities[c.slug] = created.id;
  }

  // 2) Рекламодавці + банери
  const advertisers = [
    {
      name: 'Будмаркет «Майстер»',
      type: "будмагазин",
      ad: {
        title: "Все для ремонту та будівництва — знижки до 20%",
        tags: "ремонт, будівництво, дорога, інфраструктура",
        category: "novyny",
        img: img("budmarket", 400, 300),
      },
    },
    {
      name: 'АЗС «Паливо+»',
      type: "АЗС",
      ad: {
        title: "Якісне пальне за вигідними цінами",
        tags: "транспорт, дорога, пальне",
        category: "novyny",
        img: img("azs", 400, 300),
      },
    },
    {
      name: 'Кафе «Затишок»',
      type: "кафе",
      ad: {
        title: "Кава та свіжа випічка щодня",
        tags: "кафе, їжа, відпочинок, родина",
        category: "afisha",
        img: img("cafe", 400, 300),
      },
    },
    {
      name: '«ГромадаБанк»',
      type: "банк",
      ad: {
        title: "Кредит на розвиток бізнесу — від 0,01%",
        tags: "бізнес, фінанси, бюджет",
        category: "biznes",
        img: img("bank", 400, 300),
      },
    },
    {
      name: 'Аптека «Здоров’я»',
      type: "аптека",
      ad: {
        title: "Знижки на ліки для всієї родини",
        tags: "аптека, здоров'я, родина",
        category: "novyny",
        img: img("pharmacy", 400, 300),
      },
    },
  ];

  for (const a of advertisers) {
    const advertiser = await prisma.advertiser.create({
      data: { name: a.name, type: a.type },
    });
    await prisma.ad.create({
      data: {
        title: a.ad.title,
        imageUrl: a.ad.img,
        linkUrl: "https://example.com",
        tags: a.ad.tags,
        active: true,
        advertiserId: advertiser.id,
        categoryId: categories[a.ad.category] ?? null,
      },
    });
  }

  // 3) Новини
  const now = Date.now();
  const day = 86400000;
  const articles: Array<{
    slug: string;
    category: string;
    community?: string; // slug громади; без поля = загальнорайонна
    title: string;
    excerpt: string;
    tags: string;
    img: string;
    days: number;
    views?: number;
    breaking?: boolean;
  }> = [
    {
      slug: "kapremont-tsentralnoyi-dorohy",
      category: "novyny",
      community: "broshniv-osadska",
      title: "У громаді стартував капітальний ремонт центральної дороги",
      excerpt:
        "Роботи триватимуть три місяці. Дорожники оновлять покриття, тротуари та зливову каналізацію.",
      tags: "дорога, ремонт, інфраструктура, будівництво",
      img: img("road"),
      days: 0,
      views: 1243,
      breaking: true,
    },
    {
      slug: "novyy-simeynyi-park",
      category: "novyny",
      title: "Відкрито новий сімейний парк відпочинку",
      excerpt:
        "На місці пустиря облаштували зони для пікніків, дитячий майданчик і велодоріжки.",
      tags: "відпочинок, парк, родина",
      img: img("park"),
      days: 1,
    },
    {
      slug: "byudzhet-hromady",
      category: "polityka",
      community: "dolynska",
      title: "Рада ухвалила бюджет громади на наступний рік",
      excerpt:
        "Найбільші статті видатків — освіта, дороги та медицина. Депутати підтримали проєкт одноголосно.",
      tags: "бюджет, рада, фінанси",
      img: img("council"),
      days: 2,
    },
    {
      slug: "pekarnya-rozshyryuye-vyrobnytstvo",
      category: "biznes",
      title: "Місцева пекарня розширює виробництво й шукає працівників",
      excerpt:
        "Підприємство відкриває другий цех і планує постачати хліб у сусідні села.",
      tags: "бізнес, їжа, кафе, робота",
      img: img("bakery"),
      days: 3,
    },
    {
      slug: "yarmarok-mistsevyh-vyrobnykiv",
      category: "afisha",
      title: "Цими вихідними — ярмарок місцевих виробників",
      excerpt:
        "На центральній площі представлять фермерські продукти, вироби ручної роботи та вуличну їжу.",
      tags: "подія, ярмарок, відпочинок, їжа",
      img: img("fair"),
      days: 4,
    },
    {
      slug: "potriben-vodiy-kp",
      category: "vakansii",
      title: "Комунальне підприємство шукає водія",
      excerpt:
        "Офіційне працевлаштування, повний соцпакет, графік 5/2. Деталі — за телефоном.",
      tags: "робота, вакансія, транспорт",
      img: img("driver"),
      days: 5,
    },
    {
      slug: "hrafik-vidklyuchennya-vody",
      category: "ogoloshennya",
      title: "Графік планового відключення води на цьому тижні",
      excerpt:
        "Через ремонтні роботи на мережі водопостачання можливі тимчасові відключення.",
      tags: "оголошення, комунальні, вода",
      img: img("water"),
      days: 6,
    },
  ];

  for (const a of articles) {
    await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: `${a.excerpt}\n\nЦе демонстраційний текст новини для прототипу порталу. Тут розміщується повний матеріал статті з усіма подробицями події.\n\nДодаткові абзаци допомагають побачити, як виглядає сторінка новини та як поруч відображається контекстна реклама місцевого бізнесу, підібрана за темою матеріалу.`,
        coverImage: a.img,
        tags: a.tags,
        status: "published",
        breaking: a.breaking ?? false,
        views: a.views ?? 200 + Math.floor(Math.random() * 800),
        publishedAt: new Date(now - a.days * day),
        categoryId: categories[a.category],
        communityId: a.community ? communities[a.community] : null,
      },
    });
  }

  console.log(
    `Готово: ${CATEGORIES.length} розділів, ${advertisers.length} рекламодавців, ${articles.length} новин.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
