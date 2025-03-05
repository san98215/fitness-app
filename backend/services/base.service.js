class BaseService {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await this.model.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    async findOne(query) {
        try {
            return await this.model.findOne(query);
        } catch (error) {
            throw error;
        }
    }

    async findAll(query = {}) {
        try {
            return await this.model.findAll(query);
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updated] = await this.model.update(data, {
                where: { id: id }
            });
            if (updated) {
                return await this.findById(id);
            }
            throw new Error('Record not found');
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const deleted = await this.model.destroy({
                where: { id: id }
            });
            if (!deleted) {
                throw new Error('Record not found');
            }
            return deleted;
        } catch (error) {
            throw error;
        }
    }
}

export default BaseService; 