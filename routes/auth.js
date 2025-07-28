



const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// route: POST /register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create new user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
  }
});






// route: POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'المستخدم غير موجود' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
    }

   
    if (!user.is_active) {
      return res.status(403).json({ message: 'تم تعطيل حسابك' });
    }

    req.session.userId = user._id;
    req.session.is_admin = user.is_admin;

    res.json({ message: 'تم تسجيل الدخول بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

//تجريب للمستخدمين المسجلين والمديرين
const { isAuthenticated, isAdmin } = require('../middleware/auth');


router.get('/check-auth', isAuthenticated, (req, res) => {
  res.json({ message: 'أنت مسجل دخول ' });
});


router.get('/check-admin', isAdmin, (req, res) => {
  res.json({ message: 'أنت مدير ' });
});



// route: POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الخروج' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
});




const Transfer = require('../models/Transfer'); 

// route: POST /transfer
router.post('/transfer', isAuthenticated, async (req, res) => {
  try {
    const { email, amount } = req.body;

    
    if (!email || !amount) {
      return res.status(400).json({ message: 'يجب إدخال البريد والمبلغ' });
    }

   
    const sender = await User.findById(req.session.userId);
    if (!sender || !sender.is_active) {
      return res.status(403).json({ message: 'الحساب غير مفعل' });
    }

   
    const receiver = await User.findOne({ email });
    if (!receiver) {
      return res.status(404).json({ message: 'المستخدم المستقبل غير موجود' });
    }

    if (receiver._id.equals(sender._id)) {
      return res.status(400).json({ message: 'لا يمكنك تحويل المال لنفسك' });
    }

  
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'الرصيد غير كافٍ' });
    }

   
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

   
    const transfer = new Transfer({
      sender: sender._id,
      receiver: receiver._id,
      amount,
    });

    await transfer.save();

    res.json({ message: 'تم التحويل بنجاح ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء التحويل' });
  }
});

// route: GET /my-transfers
router.get('/my-transfers', isAuthenticated, async (req, res) => {
  try {
    const transfers = await Transfer.find({ sender: req.session.userId })
      .populate('receiver', 'email fullName') 
      .sort({ date: -1 }); 

    const formattedTransfers = transfers.map(t => ({
      to: t.receiver.email,
      to_name: t.receiver.fullName,
      amount: -t.amount,
      date: t.date,
    }));

    res.json({ transfers: formattedTransfers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء عرض التحويلات' });
  }
});


// route: GET /incoming-transfers
router.get('/incoming-transfers', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const transfers = await Transfer.find({ receiver: userId })
      .populate('sender', 'email fullName') 
      .sort({ date: -1 });  

    const formattedTransfers = transfers.map(t => ({
      from: t.sender.email,
      from_name: t.sender.fullName,
      amount: t.amount, 
      date: t.date,
    }));

    res.json({ transfers: formattedTransfers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء عرض التحويلات الواردة' });
  }
});


// route: GET /balance
router.get('/balance', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('balance');
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ أثناء جلب الرصيد' });
  }
});


// route: GET /admin/all-transfers
router.get('/admin/all-transfers', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('sender', 'email fullName')
      .populate('receiver', 'email fullName')
      .sort({ date: -1 });

    const formatted = transfers.map(t => {
      const senderInfo = t.sender 
        ? `${t.sender.fullName} (${t.sender.email})`
        : `مستخدم محذوف (ID: ${t.sender})`;
      
      const receiverInfo = t.receiver 
        ? `${t.receiver.fullName} (${t.receiver.email})`
        : `مستخدم محذوف (ID: ${t.receiver})`;

      return {
        from: senderInfo,
        to: receiverInfo,
        amount: t.amount,
        date: t.date,
      };
    });

    res.json({ transfers: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ أثناء عرض كل التحويلات' });
  }
});


// route: PATCH /admin/deactivate-user
router.patch('/admin/deactivate-user', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.is_active = false;
    await user.save();

    res.json({ message: `تم تعطيل حساب ${user.email} بنجاح ` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء تعطيل المستخدم' });
  }
});



// route: PATCH /admin/activate-user
router.patch('/admin/activate-user', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.is_active = true;
    await user.save();

    res.json({ message: `تم تفعيل حساب ${user.email} بنجاح ` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء تفعيل المستخدم' });
  }
});




module.exports = router;
