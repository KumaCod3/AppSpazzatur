const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Schema per la definizione degli elementi (Tabella di lookup)
const ElementDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icona: String,
  colore: String
});
const Elementi = mongoose.model('Elementi', ElementDefinitionSchema);

// Schema Principale
const DailyPlanSchema = new mongoose.Schema({
  giorno: {
    type: Number,
    required: true
  },
  elementi: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elementi' // Nome del modello a cui puntiamo
  }]
});
const Giorni = mongoose.model('Giorni', DailyPlanSchema);

class DBspazzatura {
	constructor() {
	//	this.dbUrl = 'mongodb://127.0.0.1:27017/spazzatura';
	//	this.dbUrl = 'mongodb://192.168.1.15:27017/spazzatura';
		this.dbUrl = process.env.MONGODB_URI;
	}

	async init() {
		try {
			await mongoose.connect(this.dbUrl, {
				serverSelectionTimeoutMS: 5000 
			});
			console.log('Connesso a MongoDB tramite Mongoose!');
		} catch (err) {
			console.error('Errore di connessione a MongoDB:', err);
			throw err;
		}
	}

	//  ----------  GIORNI  -----------
	async getAllGiorni() {
		try {
			const giorni = await Giorni.find()
				.populate('elementi')
				.sort({ giorno: 1 })
				.lean();
			console.log("cerco tutti giorni, trovo: " + giorni);
			return giorni;
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione di giorni:', err);
			throw err;
		}
		return giorni;
	}

	async removeSingleGiorno(identificatore) {
		try {
			let item = await Giorni.findByIdAndDelete(identificatore);

			if (!item) {
				item = await Giorni.findOneAndDelete({ 'giorno': identificatore });
			}
			return item;
		} catch (err) {
			console.error("Errore durante l'eliminazione:", err);
			throw err;
		}
	}

	async removeAllGiorni() {
		try {
			await Giorni.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
	
	async getSingleGiorno(identificatore) {
		let giorno = null;
		try {
			giorno = await Giorni.findById(identificatore);
			if (giorno==null){
				giorno = await Giorni.findOne({ 'giorno': identificatore });
			}
		} catch (e) {
			error.log("giorno non trovato "+e);
		}
		return giorno;
	}
	
	async removeOldGiorno() {
		const oggi = new Date();
		const mese = oggi.getMonth() + 1;
		const numeroGiorno = oggi.getDate();

		// Formato MMDD (es. 15 Marzo -> 315)
		const identificatoreOggi = (mese * 100) + numeroGiorno;

		try {
			const risultato = await Giorni.deleteMany({
				giorno: { $lt: identificatoreOggi }
			});

			return risultato;
		} catch (err) {
			console.error("Errore durante l'eliminazione dei giorni passati:", err);
			throw err;
		}
	}
	
	async addGiorno(dateInput, elementIdentifier) {
		let elementId = elementIdentifier;

		try {
			if (!mongoose.Types.ObjectId.isValid(elementIdentifier)) {
				console.log(`"${elementIdentifier}" non è un ID. Cerco l'elemento per nome...`);
				const foundElement = await Elementi.findOne({ 'name': elementIdentifier });
				
				if (!foundElement) {
					console.error("Errore: Nessun elemento trovato con il nome: " + elementIdentifier);
					return null;
				}
				elementId = foundElement._id;
			}

			const updatedPlan = await Giorni.findOneAndUpdate(
				{ giorno: dateInput },
				{ 
					$addToSet: { 'elementi': elementId } 
				},
				{ 
					new: true, 
					upsert: true 
				}
			).populate('elementi');

			console.log("Piano aggiunto correttamente per:", dateInput);
			return await this.getAllGiorni();

		} catch (err) {
			console.error("Errore durante l'operazione addElementToDate:", err);
			throw err;
		}
	}
	
	//  ----------  ELEMENTI  -----------
	async removeAllElementi() {
		try {
			await Elementi.deleteMany({}); // per droppare tutte ricette!!!!
			return null;
		} catch (err) {
			console.error(err);
			throw err;
		}
	} 
	
	async getAllElementi() {
		let elementi = [];
		try {
			elementi = await Elementi.find().lean();
		} catch (err) {
			console.error('C\'è stato un problema con l\'estrazione degli elementi:', err);
			throw err;
		}
		return elementi;
	} 
	
	async getSingleElemento(identificatore) {
		let elemento = null;
		try {
			elemento = await Elementi.findById(identificatore);
			if (elemento==null){
				elemento = await Elementi.findOne({ 'name': identificatore });
			}
		} catch (e) {
			error.log("Elemento non trovato "+e);
		}
		return elemento;
	}
		
	async RemoveSingleElemento(identificatore) {
		try {
			let deletedElement = await Elementi.findByIdAndDelete(identificatore);
			
			if (!deletedElement){
				deletedElement = await Elementi.findByOneAndDelete({ 'name': identificatore });
			}
			
			if (deletedElement) {
				await Giorni.updateMany(
					{ elementi: identificatore }, 
					{ $pull: { elementi: identificatore } }
				);
				console.log("Elemento rimosso e riferimenti puliti.");
			}
			
			const cleanupResult = await Giorni.deleteMany({ 
                elementi: { $size: 0 } 
            });
			
			return deletedElement;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async addElemento(nome, colore, icona) {
		try {
			const esistente = await Elementi.findOne({ 'nome': nome });
			if (esistente) {
				console.log(`L'elemento "${nome}" esiste già (ID: ${esistente._id})`);
				return esistente;
			}

			const nuovoElemento = new Elementi({
				name: nome,
				colore: colore,
				icona: icona
			});

			const salvato = await nuovoElemento.save();
			console.log("Nuova definizione creata con successo:", salvato.name);
			return salvato;

		} catch (err) {
			console.error("Errore durante la creazione della definizione:", err.message);
			throw err;
		}
	}

	async getGiorno(data) {
		const oggi = data ? new Date(data) : new Date();
		const mese = oggi.getMonth() + 1; 
		const numeroGiorno = oggi.getDate();

		const identificatore = (mese * 100) + numeroGiorno;

		let giorno = null;
		try {
			giorno = await Giorni.findOne({ 'giorno': identificatore }).populate('elementi').lean();
		} catch (e) {
			console.error("Errore nella ricerca del giorno: " + e);
		}
		
		return giorno;
	}
	
	
	
	//  ----------  FINE  -----------
	async close() {
		try {
			await mongoose.disconnect();
			console.log('Disconnesso da MongoDB.');
		} catch (err) {
			console.error('Errore durante la disconnessione da MongoDB:', err);
		}
	}
}

module.exports = DBspazzatura;


// per altro db:
/*
async getGiorno(data) {
	
	
	// TODO convertire data in identificatore --> es: 22 maggio == 522
	
	let giorno = null;
	try {
		giorno = await Giorni.findOne({ 'giorno': identificatore });
	} catch (e) {
		error.log("giorno non trovato "+e);
	}
	return giorno;
}
*/