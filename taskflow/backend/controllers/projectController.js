const Project = require('../models/projectModel');

exports.createProject = async (req, res) => {
    try {
        const { name, description, owner } = req.body;

        if (!name || !description || !owner) {
            return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
        }

        const newProject = await Project.create({ name, description, owner });

        req.io.emit('project_created', newProject)

        return res.status(201).json(newProject);
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
}

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách", error: error.message });
    }
}

exports.getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy dự án" });
        }
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
}

exports.updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const updateProject = await Project.findByIdAndUpdate(projectId, req.body, { new: true });
        if (!updateProject) {
            return res.status(404).json({ message: "Không tìm thấy dự án để sửa" });
        }
        return res.status(200).json({ message: "Cập nhật thành công", project: updateProject });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const deleteProject = await Project.findByIdAndDelete(projectId);

        if (!deleteProject) {
            return res.status(404).json({ message: "Không tìm thấy dự án để xóa" });
        }
        res.status(200).json({ message: "Xóa dự án thành công!" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
}