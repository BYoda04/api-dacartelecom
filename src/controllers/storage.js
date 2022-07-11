const PUBLIC_URL = process.env.PUBLIC_URL;

//models
const { Storage } = require('../models/SQL/storage');

//utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

//controllers
const create = catchAsync(async (req,res,next)=>{
    const { file,userSession } = req;

    const newFile = await Storage.create({
        url: `${PUBLIC_URL}/${userSession.role}/${file.filename}`
    });

    res.status(200).json({
        status: 'success',
        newFile
    })
});

const deleted = catchAsync(async (req,res,next)=>{
    const { file } = req;

    await file.update({
        status: false
    });

    res.status(200).json({
        status: 'success'
    })
})

module.exports = {
    create,
    deleted
};