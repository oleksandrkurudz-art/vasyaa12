import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../src/lib/categories";
import { COMMUNITIES } from "../src/lib/communities";
import { slugify } from "../src/lib/slug";

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
  await prisma.business.deleteMany();
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

  // 2) Бізнеси (каталог /kataloh) + банери
  const day = 86400000;
  const businesses: Array<{
    name: string;
    category: string; // slug з BUSINESS_CATEGORIES
    community?: string; // slug громади; без поля = весь район
    phone?: string;
    address?: string;
    website?: string;
    description: string;
    tags: string;
    img: string;
    active?: boolean; // за замовчуванням true
    paidDays?: number; // «оплачено до» = зараз + paidDays (від'ємне = прострочено)
    ad?: { title: string; tags: string; category: string }; // прив'язаний банер
  }> = [
    {
      name: 'Будмаркет «Майстер»',
      category: "budivnytstvo",
      community: "broshniv-osadska",
      phone: "+380 67 123 45 67",
      address: "смт Брошнів-Осада, вул. Січових Стрільців, 12",
      description:
        "Усе для ремонту та будівництва: матеріали, інструмент, фарби. Доставка по громаді.",
      tags: "ремонт, будівництво, дорога, інфраструктура",
      img: img("budmarket", 800, 600),
      ad: {
        title: "Все для ремонту та будівництва — знижки до 20%",
        tags: "ремонт, будівництво, дорога, інфраструктура",
        category: "novyny",
      },
    },
    {
      name: 'АЗС «Паливо+»',
      category: "avto",
      phone: "+380 50 222 33 44",
      address: "траса Долина–Калуш, 5 км",
      description: "Якісне пальне, автомийка та кава на виніс цілодобово.",
      tags: "транспорт, дорога, пальне, авто",
      img: img("azs", 800, 600),
    },
    {
      name: 'Кафе «Затишок»',
      category: "kafe-restorany",
      community: "kaluska",
      phone: "+380 97 555 66 77",
      address: "м. Калуш, вул. Грушевського, 8",
      description:
        "Свіжа випічка, ароматна кава та домашні обіди щодня. Затишний зал для родинного відпочинку.",
      tags: "кафе, їжа, кава, відпочинок, родина",
      img: img("cafe", 800, 600),
      ad: {
        title: "Кава та свіжа випічка щодня",
        tags: "кафе, їжа, відпочинок, родина",
        category: "afisha",
      },
    },
    {
      name: 'Аптека «Здоров’я»',
      category: "medytsyna",
      community: "dolynska",
      phone: "+380 66 888 99 00",
      address: "м. Долина, вул. Незалежності, 21",
      description: "Ліки, вітаміни та товари для здоров'я всієї родини.",
      tags: "аптека, здоров'я, родина, ліки",
      img: img("pharmacy", 800, 600),
    },
    {
      name: 'Салон краси «Орхідея»',
      category: "krasa",
      community: "kaluska",
      phone: "+380 63 111 22 33",
      address: "м. Калуш, вул. Франка, 3",
      description: "Перукарські послуги, манікюр, косметологія. Запис за телефоном.",
      tags: "краса, перукарня, манікюр",
      img: img("salon", 800, 600),
    },
    {
      name: 'Магазин «Село-маркет»',
      category: "torhivlia",
      community: "perehinska",
      phone: "+380 68 444 55 66",
      address: "смт Перегінське, вул. Центральна, 47",
      description: "Продукти, побутові товари та свіжий хліб у центрі селища.",
      tags: "магазин, продукти, торгівля",
      img: img("shop", 800, 600),
    },
    // Демонстрація фільтра видимості:
    {
      name: 'Ферма «Зелений лан»',
      category: "silske",
      community: "vyhodska",
      phone: "+380 95 777 88 99",
      description: "Свіжі овочі, молочка та мед напряму від господарства.",
      tags: "ферма, овочі, мед",
      img: img("farm", 800, 600),
      paidDays: -3, // прострочено — не показується в каталозі
    },
    {
      name: 'Автосервіс «Гараж»',
      category: "avto",
      community: "kaluska",
      phone: "+380 50 000 11 22",
      description: "Ремонт та обслуговування авто. Тимчасово вимкнено.",
      tags: "авто, сервіс, ремонт",
      img: img("garage", 800, 600),
      active: false, // вимкнено — не показується
    },
  ];

  for (const b of businesses) {
    const business = await prisma.business.create({
      data: {
        slug: slugify(b.name),
        name: b.name,
        description: b.description,
        category: b.category,
        phone: b.phone ?? null,
        address: b.address ?? null,
        website: b.website ?? null,
        photo: b.img,
        tags: b.tags,
        active: b.active ?? true,
        paidUntil: b.paidDays !== undefined ? new Date(Date.now() + b.paidDays * day) : null,
        communityId: b.community ? communities[b.community] : null,
      },
    });
    if (b.ad) {
      await prisma.ad.create({
        data: {
          title: b.ad.title,
          imageUrl: img(slugify(b.name) + "-ad", 400, 300),
          linkUrl: "", // порожнє — банер веде на картку бізнесу
          tags: b.ad.tags,
          active: true,
          businessId: business.id,
          categoryId: categories[b.ad.category] ?? null,
        },
      });
    }
  }

  // 3) Новини
  const now = Date.now();
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
    `Готово: ${CATEGORIES.length} розділів, ${businesses.length} бізнесів, ${articles.length} новин.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
