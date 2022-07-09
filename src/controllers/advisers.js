const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//models
const { Advisers } = require('../models/SQL/advisers');

//utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Users } = require('../models/SQL/users');
const { Campaigns } = require('../models/SQL/campaigns');
const { Sections } = require('../models/SQL/sections');
const { Turns } = require('../models/SQL/turns');

//controllers
const create = catchAsync(async (req,res,next)=>{

    const { 
        email,
        password,
        name,
        last_name,
        img_profile,
        userId,
        campaignId,
        sectionId,
        turnId
    } = req.body;

	const salt = await bcrypt.genSalt(12);
	const encryptPass = await bcrypt.hash(password,salt);

    const newAdviser = await Advisers.create({
        email,
        password: encryptPass,
        name,
        last_name,
        img_profile,
        userId,
        campaignId,
        sectionId,
        turnId
    })

	newAdviser.password = undefined
    
    res.status(201).json({
        status: 'succes',
        newAdviser
    })
});

const update = catchAsync(async (req,res,next)=>{
    const { adviser } = req;
    const {
        last_password,
        password,
        name,
        last_name,
        img_profile,
        userId,
        campaignId,
        sectionId,
        turnId
    } = req.body;

    const validPass = await bcrypt.compare(last_password,adviser.password);

    if (!validPass) {
        return next(new AppError('Invalid password',404));
    };

    const passRepeat = await bcrypt.compare(password,adviser.password);

    if (passRepeat) {
        return next(new AppError('Password same as your previous password',404))
    }

	const salt = await bcrypt.genSalt(12);
	const encryptPass = await bcrypt.hash(password,salt);

    await adviser.update({
        password: encryptPass,
        name,
        last_name,
        img_profile,
        userId,
        campaignId,
        sectionId,
        turnId
    });
    
    res.status(200).json({
        status: 'succes',
    });
})

const deleted = catchAsync(async (req,res,next)=>{
    const { adviser } = req;

    await adviser.update({
        status: false
    });

    res.status(201).json({
        status: 'success'
    })
});

const getItems = catchAsync(async (req,res,next)=>{
    const data = await Advisers.findAll({
        where:{
            status: true
        },
        include:[
            {
                model:Users,
                include:[
                    {
                        model:Campaigns,
                        attributes: ['id','name','createdAt','updatedAt']
                    },
                    {
                        model:Sections,
                        attributes: ['id','name','createdAt','updatedAt']
                    },
                ],
                attributes: ['id','email','name','last_name','img_profile','createdAt','updatedAt']
            },
            {
                model:Campaigns,
                attributes: ['id','name','createdAt','updatedAt']
            },
            {
                model:Sections,
                attributes: ['id','name','createdAt','updatedAt']
            },
            {
                model:Turns,
                attributes: ['id','name','entrance_time','exit_time','createdAt','updatedAt']
            }
        ],
        attributes: ['id','email','name','last_name','img_profile','createdAt','updatedAt']
    });

    res.status(201).json({
        status: 'success',
        data
    });
});

const getItem = catchAsync(async (req,res,next)=>{
    const { adviser } = req;

    adviser.password = undefined;

    res.status(201).json({
        status: 'success',
        adviser
    })
})

module.exports = { 
    create,
    update,
    deleted,
    getItems,
    getItem
}
