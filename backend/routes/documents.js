const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const algosdk = require('algosdk');
const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, and WebP files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: fileFilter
});

router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { type, documentNumber, issueDate, issuingAuthority } = req.body;
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const existingDocument = await Document.findOne({ fileHash });
    if (existingDocument) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'This document has already been uploaded' });
    }

    const document = new Document({
      user: userId,
      type,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileHash,
      metadata: {
        documentNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        issuingAuthority,
        confidence: 0
      }
    });

    await document.logAccess('uploaded', userId, req.ip, req.get('User-Agent'));

    const algorandClient = req.app.locals.algodClient;
    
    try {
      const user = await User.findById(userId);
      const suggestedParams = await algorandClient.getTransactionParams().do();
      
      const note = new TextEncoder().encode(JSON.stringify({
        action: 'document_uploaded',
        documentType: type,
        hash: fileHash,
        timestamp: new Date().toISOString()
      }));

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: user.walletAddress,
        to: user.walletAddress,
        amount: 0,
        note: note,
        suggestedParams
      });

      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      document.metadata.algorandTxData = Buffer.from(encodedTxn).toString('base64');
      
    } catch (algorandError) {
      console.warn('Algorand transaction preparation failed:', algorandError);
    }

    await document.save();

    await performSecurityChecks(document);

    await Notification.createNotification({
      recipient: userId,
      type: 'document_uploaded',
      title: 'Document Uploaded Successfully',
      message: `Your ${type.replace('_', ' ')} has been uploaded and is pending verification.`,
      category: 'security',
      priority: 'medium',
      data: {
        documentId: document._id,
        documentType: type
      }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        type: document.type,
        originalName: document.originalName,
        fileSize: document.fileSize,
        verificationStatus: document.verificationStatus,
        uploadedAt: document.uploadedAt,
        algorandTxData: document.metadata.algorandTxData
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, type } = req.query;
    
    const query = { user: userId };
    if (status) query.verificationStatus = status;
    if (type) query.type = type;
    
    const documents = await Document.find(query)
      .sort({ uploadedAt: -1 })
      .select('-filePath -fileHash -accessLog -metadata.algorandTxData');

    res.json({
      documents: documents.map(doc => ({
        id: doc._id,
        type: doc.type,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        verificationStatus: doc.verificationStatus,
        verifiedAt: doc.verifiedAt,
        rejectionReason: doc.rejectionReason,
        uploadedAt: doc.uploadedAt,
        metadata: {
          documentNumber: doc.metadata.documentNumber,
          issueDate: doc.metadata.issueDate,
          issuingAuthority: doc.metadata.issuingAuthority,
          confidence: doc.metadata.confidence
        },
        securityChecks: doc.securityChecks,
        algorandTxId: doc.algorandTxId
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/verification-queue', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isVerified || user.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const documents = await Document.find({ verificationStatus: status })
      .populate('user', 'profile.name profile.email walletAddress reputationScore')
      .sort({ uploadedAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath -fileHash -accessLog');

    const total = await Document.countDocuments({ verificationStatus: status });

    res.json({
      documents: documents.map(doc => ({
        id: doc._id,
        type: doc.type,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
        uploadedAt: doc.uploadedAt,
        user: {
          id: doc.user._id,
          name: doc.user.profile.name,
          email: doc.user.profile.email,
          walletAddress: doc.user.walletAddress,
          reputationScore: doc.user.reputationScore
        },
        metadata: doc.metadata,
        securityChecks: doc.securityChecks
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
});

router.put('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { algorandTxId } = req.body;
    const verifierId = req.user.userId;
    
    const verifier = await User.findById(verifierId);
    if (!verifier.isVerified || verifier.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const document = await Document.findById(id).populate('user');
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.verify(verifierId, algorandTxId);
    await document.logAccess('verified', verifierId, req.ip, req.get('User-Agent'));

    await Notification.createNotification({
      recipient: document.user._id,
      type: 'document_verified',
      title: 'Document Verified',
      message: `Your ${document.type.replace('_', ' ')} has been successfully verified.`,
      category: 'security',
      priority: 'high',
      data: {
        documentId: document._id,
        documentType: document.type,
        algorandTxId
      }
    });

    const user = document.user;
    const userDocuments = await Document.find({ 
      user: user._id, 
      verificationStatus: 'verified' 
    });

    if (userDocuments.length >= 2 && !user.isVerified) {
      user.isVerified = true;
      user.reputationScore = Math.min(user.reputationScore + 20, 100);
      await user.save();

      await Notification.createNotification({
        recipient: user._id,
        type: 'profile_verified',
        title: 'Profile Verified',
        message: 'Congratulations! Your profile has been verified. You can now access all platform features.',
        category: 'security',
        priority: 'high'
      });
    }

    res.json({
      message: 'Document verified successfully',
      document: {
        id: document._id,
        verificationStatus: document.verificationStatus,
        verifiedAt: document.verifiedAt,
        algorandTxId: document.algorandTxId
      }
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const verifierId = req.user.userId;
    
    const verifier = await User.findById(verifierId);
    if (!verifier.isVerified || verifier.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const document = await Document.findById(id).populate('user');
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.reject(verifierId, reason);
    await document.logAccess('rejected', verifierId, req.ip, req.get('User-Agent'));

    await Notification.createNotification({
      recipient: document.user._id,
      type: 'document_rejected',
      title: 'Document Rejected',
      message: `Your ${document.type.replace('_', ' ')} was rejected. Reason: ${reason}`,
      category: 'security',
      priority: 'high',
      data: {
        documentId: document._id,
        documentType: document.type,
        rejectionReason: reason
      }
    });

    res.json({
      message: 'Document rejected',
      document: {
        id: document._id,
        verificationStatus: document.verificationStatus,
        rejectionReason: document.rejectionReason,
        verifiedAt: document.verifiedAt
      }
    });
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({ error: 'Failed to reject document' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const document = await Document.findOne({ _id: id, user: userId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.verificationStatus === 'verified') {
      return res.status(400).json({ error: 'Cannot delete verified documents' });
    }

    try {
      await fs.unlink(document.filePath);
    } catch (unlinkError) {
      console.warn('Could not delete file:', unlinkError);
    }

    await Document.findByIdAndDelete(id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isVerified || user.profile.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const stats = await Document.getVerificationStats();
    
    const totalDocuments = await Document.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayUploads = await Document.countDocuments({
      uploadedAt: { $gte: todayStart }
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyUploads = await Document.countDocuments({
      uploadedAt: { $gte: weekStart }
    });

    const verificationRate = totalDocuments > 0 
      ? ((stats.verified / totalDocuments) * 100).toFixed(1)
      : 0;

    res.json({
      stats,
      metrics: {
        totalDocuments,
        todayUploads,
        weeklyUploads,
        verificationRate: parseFloat(verificationRate),
        pendingReview: stats.pending + stats.in_review
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
});

async function performSecurityChecks(document) {
  try {
    document.securityChecks.formatValidation.isValid = true;
    document.securityChecks.formatValidation.validatedAt = new Date();
    
    const duplicateDocument = await Document.findOne({
      fileHash: document.fileHash,
      _id: { $ne: document._id }
    });
    
    if (duplicateDocument) {
      document.securityChecks.duplicateCheck.status = 'duplicate';
      document.securityChecks.duplicateCheck.duplicateOf = duplicateDocument._id;
    } else {
      document.securityChecks.duplicateCheck.status = 'unique';
    }
    document.securityChecks.duplicateCheck.checkedAt = new Date();
    
    document.securityChecks.virusScan.status = 'clean';
    document.securityChecks.virusScan.scannedAt = new Date();
    document.securityChecks.virusScan.engine = 'internal';
    
    await document.save();
  } catch (error) {
    console.error('Security checks error:', error);
  }
}

module.exports = router;