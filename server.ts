import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { productsData } from './src/data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Lazy initialize client and read Key
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      apiConfigured: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development'
    });
  });

  // AI Hardware Advisor Chatbot endpoint
  app.post('/api/advisor', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          response: "⚠️ کلید اختصاصی Gemini (GEMINI_API_KEY) در پنل تنظیمات Secrets یافت نشد. لطفاً آن را تنظیم فرمایید تا مشاوره هوشمند فعال شود. با این وجود، می‌توانید همچنان از بخش محاسبه‌گر سخت‌افزار اتوماتیک استفاده کنید.\n\n(Gemini API key is not configured in Settings > Secrets. Please add it to enable real-time AI hardware consultation.)"
        });
      }

      // Convert products array to a clean compact summary for AI context
      const productsSummary = productsData.map(p => ({
        id: p.id,
        name: p.name,
        englishName: p.englishName,
        brand: p.brand,
        category: p.category,
        useCase: p.useCase,
        price: p.discountPrice || p.price,
        specs: `پردازنده: ${p.specs.cpu} | رم: ${p.specs.ram} | حافظه: ${p.specs.storage} | گرافیک: ${p.specs.gpu} | کولینگ: ${p.specs.cooling}`,
        shortDesc: p.shortDescription
      }));

      const systemInstruction = `شما یک مشاور متخصص و تکنیکی سخت‌افزار مینی‌پی‌سی (Mini PC)، مینی‌کیس (Mini Case) و لپ‌تاپ‌های مسافرتی برای فروشگاه آنلاین "Mini PC Store" هستید.
      وظیفه شما این است که بر اساس لیست محصولات موجود در فروشگاه ما که در زیر آمده است، به کاربران مشاوره تخصصی، علمی و صادقانه در خرید بدهید.
      
      لیست محصولات موجود در فروشگاه:
      ${JSON.stringify(productsSummary, null, 2)}
      
      قوانین پاسخ‌دهی شما:
      1. زبان پاسخ حتماً و قطعاً "فارسی روان" باشد.
      2. با احترام، صمیمیت و حرفه‌ای‌گری فوق‌العاده صحبت کنید.
      3. اگر کاربر بودجه مشخصی گفت (به تومان)، محصولاتی که با بودجه او همخوانی دارند را برجسته کنید (قیمت‌ها به زبان تومان هستند).
      4. مشخصات فنی پردازنده، رم و گرافیک را با هم مقایسه کنید تا کاربر بهترین خرید را با توجه به کاربری انتخاب کند.
      5. تنها محصولاتی که نام برده شده‌اند را پیشنهاد دهید. اگر محصولی در لیست زیر وجود ندارد، به کاربر بگویید در حال حاضر آن را نداریم اما بهترین جایگزین‌های آن در لیست ما فلان و فلان مدل هستند.
      6. پاسخ خود را با استفاده از پاراگراف‌های خوانا، بولت پوینت‌ها و ایموجی‌های مناسب، تمیز و مرتب بنویسید به طوری که کاربر خسته نشود.
      7. اگر کاربر سؤال نامرتبط با کامپیوتر یا سخت‌افزار پرسید، با مهربانی او را راهنمایی کنید که شما مشاور فنی فروشگاه Mini PC هستید و مایلید در خرید کامپیوتر مینی و لپ‌تاپ به او کمک کنید.`;

      // Structure contents according to the Gemini SDK requirements
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Append the latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message || "سلام، من مایل به دریافت مشاوره خرید مینی کامپیوتر یا لپ‌تاپ هستم." }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const textResponse = response.text || "متاسفانه امکان پاسخگویی وجود ندارد، لطفا دوباره تلاش کنید.";
      return res.json({ response: textResponse });
    } catch (error: any) {
      console.error("Gemini AI API Error in backend:", error);
      return res.status(500).json({ 
        error: "تداخل در ارتباط با هوش مصنوعی رخ داده است.", 
        details: error.message 
      });
    }
  });

  // Serve static files and manage Vite dev environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
