const express = require('express');
const router = express.Router();

const {authMiddleware} = require('../middlewares/authMiddleware')

const { createDepartment , 
    getAllDepartments ,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,

} = require('../Controllers/DepartmentController')
router.use(authMiddleware)

router.post('/',createDepartment) //working
router.get('/',getAllDepartments)//working
router.get('/:id',getDepartmentById)//working
router.put('/:id',updateDepartment)//working
router.delete('/:id',deleteDepartment)//working
// router.post('/:id/task',assignTask)
// router.delete('/:id/task',removeTask)
// router.put('/:id/task',updateTask)





module.exports = router;