import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Select, DatePicker, Input, message, Table } from 'antd';
import moment from 'moment';

const { TextArea } = Input;

const API_URL = process.env.REACT_APP_API_URL;

const CreateInterventionForm = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [technicians, setTechnicians] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchMaterials();
    // Récupérer la liste des clients
    axios.get(`${API_URL}/users/clients`)
      .then(res => setClients(res.data))
      .catch(() => setClients([]));
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks`);
      setMaterials(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des matériaux');
    }
  };

  const handleAddMaterial = () => {
    if (currentMaterial && quantity > 0) {
      const material = materials.find(m => m.id === currentMaterial);
      if (quantity > material.quantity) {
        message.error(`La quantité ne peut pas dépasser le stock disponible (${material.quantity})`);
        return;
      }
      const newMaterial = {
        id: material.id,
        name: material.name,
        quantity: quantity,
      };
      setSelectedMaterials([...selectedMaterials, newMaterial]);
      setShowMaterialModal(false);
      setCurrentMaterial(null);
      setQuantity(1);
    }
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleRemoveMaterial(record.id)}>
          Supprimer
        </Button>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        user_id: values.technician_id,
        client_id: values.client_id,
        status: 'PLANIFIÉ',
        scheduled_date: values.scheduled_date.toISOString(),
        materials: selectedMaterials.map(material => ({
          stock_id: material.id,
          quantity_used: material.quantity
        }))
      };
      delete formattedValues.technician_id;

      await axios.post(`${API_URL}/interventions`, formattedValues);
      message.success('Intervention créée avec succès');
      form.resetFields();
      setSelectedMaterials([]);
      onSuccess();
    } catch (error) {
      message.error('Erreur lors de la création de l\'intervention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Créer une nouvelle intervention"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
      <Form.Item
          name="scheduled_date"
          label="Date prévue"
          rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) => {
              return current && current < moment().startOf('day');
            }}
            onChange={value => {
              form.setFieldsValue({ scheduled_date: value });
              // On vide le technicien si la date change
              form.setFieldsValue({ technician_id: undefined });
              if (value) {
                axios.get(`${API_URL}/users/technicians/available?date=${encodeURIComponent(value.toISOString())}`)
                  .then(res => setTechnicians(res.data))
                  .catch(() => setTechnicians([]));
              } else {
                setTechnicians([]);
              }
            }}
          />
        </Form.Item>
        <Form.Item
          name="technician_id"
          label="Technicien"
          rules={[{ required: true, message: 'Veuillez sélectionner un technicien' }]}
        >
          <Select placeholder="Sélectionnez un technicien" disabled={!form.getFieldValue('scheduled_date')}>
            {technicians.map(tech => (
              <Select.Option key={tech.id} value={tech.id}>
                {`${tech.first_name} ${tech.last_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="client_id"
          label="Client"
          rules={[{ required: true, message: 'Veuillez sélectionner un client' }]}
        >
          <Select placeholder="Sélectionnez un client">
            {clients.map(client => (
              <Select.Option key={client.id} value={client.id}>
                {client.first_name} {client.last_name} ({client.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Veuillez entrer une description' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <div className="mb-3">
          <div className="d-flex align-items-center mb-2" style={{ position: 'relative' }}>
            <h5 className="mb-0">Matériaux</h5>
            <Button
              type="primary"
              onClick={() => setShowMaterialModal(true)}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <i className="bi bi-plus" style={{ fontSize: 22 }}></i>
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={selectedMaterials}
            rowKey="id"
            pagination={false}
          />
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Créer l'intervention
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Ajouter un matériau"
        open={showMaterialModal}
        onCancel={() => {
          setShowMaterialModal(false);
          setCurrentMaterial(null);
          setQuantity(1);
        }}
        onOk={handleAddMaterial}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Form layout="vertical">
          <Form.Item label="Matériau">
            <Select
              placeholder="Sélectionnez un matériau"
              value={currentMaterial}
              onChange={setCurrentMaterial}
              style={{ width: '100%' }}
            >
              {materials.map(material => (
                <Select.Option key={material.id} value={material.id}>
                  {material.name} - Stock disponible: {material.quantity}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Quantité">
            <Input
              type="number"
              min={1}
              max={currentMaterial ? materials.find(m => m.id === currentMaterial)?.quantity : 1}
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                const maxStock = currentMaterial ? materials.find(m => m.id === currentMaterial)?.quantity : 1;
                if (value > maxStock) {
                  message.warning(`La quantité maximum disponible est ${maxStock}`);
                  setQuantity(maxStock);
                } else {
                  setQuantity(value);
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default CreateInterventionForm; 