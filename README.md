 #مشروع نظام تحويل نقود وهمي - باستخدامNode.js  وExpress.js  
 
هذا المشروع عبارة عن نظام بسيط لتحويل النقود بين المستخدمين باستخدامAPI  مبني بـExpress  وMongoDB  Atlas، وهو جزء من مشروع نهاية مرحلة تعلمExpress.js.  
 
 ميزات المشروع  
 
 -تسجيل مستخدم جديد 
 -تسجيل الدخول والخرو ج 
 -تحويل مبلغ لمستخدم آخر )إذا كان لديه رصيد كافٍ( 
 -عرض سجل التحويلات الصادرة والوارد ة 
 -عرض الرصيد الحال ي 
 -نظام صلاحيات مبسّط: مدير / مستخدم عاد ي 
 -المدير يستطيع عرض جميع التحويلات وتفعيل/تعطيل حسابات المستخدمين 
 --
 المتطلبات 
 

MongoDB Atlas  -تم استخدام قاعدة بيانات على السحابة
 ---
 تثبيت الحز م  npm install
ملف البيئة.env  
قبل تشغيل المشروع، يرجى إنشاء ملف.env  في جذر المشروع ووضع التالي: 
 
 
MONGODB_URI=mongodb+srv://omer:omer123%23%24321@cluster0.8zonp.mongodb
 .net/money_transfer?retryWrites=true&w=majority&appName=Cluster0
 SESSION_SECRET=super-secret-key
 PORT=3000
 
تشغيل المشروع  
 npx nodemon index.js
اختبار الـAPI  تم رفع جميع الطلبات ضمن ملفPostman  باسم: 
 
 money-transfer.postman_collection.json
 
 
بيانات الدخول )للتجريب(  المدير    
   "email": "omerAlali@example.com",
   "password": "omerAlali123"
 
 ملاحظات عامة المشروع صغير ولهذا تم وضع كل الراوتات في ملف واحد(auth.js) ، لكن يمكن فصلها لاحقًا بسهولة. 
 
لم يتم استخدامJWT ، بل تم الاعتماد على الجلسات(Session)  كما هو مطلوب في التوصيف. 
