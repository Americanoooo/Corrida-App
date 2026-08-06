-- ============================================
-- Calculadora de Lucro Real - Schema
-- Ordem de criacao importa por causa das FKs:
-- tabelas referenciadas primeiro, junções depois.
-- ============================================

-- Usuário
CREATE TABLE usuario (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL
);

-- 1. Catálogo puro (só PK)
CREATE TABLE moto (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  modelo    VARCHAR(100) NOT NULL,
  km_litro  DECIMAL(5,2),
  usuario_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- 2. Catálogo puro (só PK)
CREATE TABLE peca (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL
);

-- 3. Junção viva: custo/intervalo de cada peça por moto (usuário edita)
CREATE TABLE moto_peca (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  moto_id       INT NOT NULL,
  peca_id       INT NOT NULL,
  custo         DECIMAL(10,2) NOT NULL,
  intervalo_km  INT NOT NULL,
  UNIQUE (moto_id, peca_id),
  FOREIGN KEY (moto_id) REFERENCES moto(id),
  FOREIGN KEY (peca_id) REFERENCES peca(id)
);

-- 4. Corrida: fato do passado, com valores de combustível congelados
CREATE TABLE corrida (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  moto_id             INT NOT NULL,
  usuario_id 		  INT NULL,
  kms_rodados         DECIMAL(5,2),
  receita             DECIMAL(10,2),
  gasolina_congelada  DECIMAL(5,2),
  km_litro_congelado DECIMAL(5,2),
  data                DATE NOT NULL,
  FOREIGN KEY (moto_id) REFERENCES moto(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- 5. Snapshot: custo/km de cada peça congelado no momento da corrida
CREATE TABLE corrida_peca (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  corrida_id          INT NOT NULL,
  moto_peca_id        INT NOT NULL,
  custo_km_congelado  DECIMAL(6,4),
  UNIQUE (corrida_id, moto_peca_id),
  FOREIGN KEY (corrida_id) REFERENCES corrida(id),
  FOREIGN KEY (moto_peca_id) REFERENCES moto_peca(id)
);
