const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let addresses = [
  {
    _id: '1',
    userId: '1',
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南区8栋101室',
    zipCode: '518000',
    isDefault: true
  },
  {
    _id: '2',
    userId: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '望京SOHO T1 2801室',
    zipCode: '100102',
    isDefault: false
  }
];

router.get('/', authenticate, (req, res) => {
  try {
    const userAddresses = addresses.filter(a => a.userId === req.user.id);
    res.json(userAddresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const address = addresses.find(a => a._id === id && a.userId === req.user.id);
    if (!address) {
      return res.status(404).json({ message: '地址不存在或无权限操作' });
    }
    
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { name, phone, province, city, district, address, zipCode, isDefault = false } = req.body;
    
    if (!name || !phone || !province || !city || !district || !address) {
      return res.status(400).json({ message: '请填写完整的地址信息' });
    }
    
    if (isDefault) {
      addresses.forEach(addr => {
        if (addr.userId === req.user.id) {
          addr.isDefault = false;
        }
      });
    }
    
    const newAddress = {
      _id: String(addresses.length + 1),
      userId: req.user.id,
      name,
      phone,
      province,
      city,
      district,
      address,
      zipCode: zipCode || '',
      isDefault
    };
    
    addresses.push(newAddress);
    res.status(201).json(newAddress);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, province, city, district, address, zipCode, isDefault } = req.body;
    
    const addressIndex = addresses.findIndex(a => a._id === id && a.userId === req.user.id);
    if (addressIndex === -1) {
      return res.status(404).json({ message: '地址不存在或无权限操作' });
    }
    
    if (isDefault) {
      addresses.forEach(addr => {
        if (addr.userId === req.user.id) {
          addr.isDefault = false;
        }
      });
    }
    
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...(name && { name }),
      ...(phone && { phone }),
      ...(province && { province }),
      ...(city && { city }),
      ...(district && { district }),
      ...(address && { address }),
      ...(zipCode !== undefined && { zipCode }),
      ...(isDefault !== undefined && { isDefault })
    };
    
    res.json(addresses[addressIndex]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = addresses.length;
    addresses = addresses.filter(a => !(a._id === id && a.userId === req.user.id));
    
    if (addresses.length === initialLength) {
      return res.status(404).json({ message: '地址不存在或无权限操作' });
    }
    
    res.json({ message: '地址删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/default', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const address = addresses.find(a => a._id === id && a.userId === req.user.id);
    if (!address) {
      return res.status(404).json({ message: '地址不存在或无权限操作' });
    }
    
    addresses.forEach(addr => {
      if (addr.userId === req.user.id) {
        addr.isDefault = false;
      }
    });
    
    address.isDefault = true;
    res.json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;