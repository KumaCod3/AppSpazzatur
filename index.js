'use strict' 

const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require("body-parser");
const DBspazzatura = require('./DBspazzatura'); 
const db = new DBspazzatura();
const PORT = process.env.PORT;
const app = express(); 
const handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

app.use(express.json());
app.use(morgan('dev')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', handlebars.engine); 
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.get('/', async (req, res) => {
  try {
        const elementi = await db.getAllElementi();
		const giorni = await db.getAllGiorni();
		const oggiInfo = await db.getGiorno();
		res.render('homeSpazzatura', { elementi, giorni, oggiInfo });
	  } catch (err) {
		res.status(500).json({ message: err.message });
	  }
});

app.get('/paginaElementi', async (req, res) => {
  try {
	const elementi = await db.getAllElementi(); 
    res.render('inserisciElementi', { elementi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/paginaGiorni', async (req, res) => {
  try {
    const elementi = await db.getAllElementi();
    const giorni = await db.getAllGiorni();
    res.render('inserisciGiorni', { elementi, giorni });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/AllGiorni', async (req, res) => { 
	try {
	const giorni = await db.getAllGiorni();
	res.json(giorni);
  } catch (err) {
	res.status(500).json({ message: err.message });
  }
});

app.get('/AllElementi', async (req, res) => { 
	try {
	const elementi = await db.getAllElementi();
	res.json(elementi);
  } catch (err) {
	res.status(500).json({ message: err.message });
  }
});

app.get('/elemento/:id', async (req, res) => {
	try {
		const _id = req.params.id;
		console.log("questo e lid "+_id);

		const elemento = await db.getSingleElemento(_id);
		res.json(elemento);
//		res.render('piano', { menu: menus });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.get('/giorno/:id', async (req, res) => {
	try {
		const _id = req.params.id;
		console.log("questo e lid "+_id);

		const giorno = await db.getSingleGiorno(_id);
		res.json(giorno);
//		res.render('piano', { menu: menus });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.post('/DELETEold', async (req, res) => { 
	try {
		await db.removeOldGiorno();
		const allGio = await db.getAllGiorni(); 
		res.json(allGio); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/DELETETUTTOgiorni', async (req, res) => { 
	try {
		await db.removeAllGiorni();
		const allGio = await db.getAllGiorni(); 
		res.json(allGio); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/DELETETUTTOelementi', async (req, res) => { 
	try {
		await db.removeAllElementi();
		const allElementi = await db.getAllElementi(); 
		res.json(allElementi); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/DELETEgiorno', async (req, res) => { 
	try {
		const identif = req.body.identificatore; 
	 
		await db.removeSingleGiorno(identif);
		const allGio = await db.getAllGiorni(); 
		res.json(allGio); 
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/DELETEelemento', async (req, res) => { 
	try {
		const identif = req.body.identificatore; 
	 
		await db.RemoveSingleElemento(identif);
		const allElementi = await db.getAllElementi(); 
		res.json(allElementi);
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/NEWelemento', async (req, res) => {
	try {
		const nome = req.body.nome || 'noName'; 
		const colore = req.body.colore || 'noColor'; 
		const icona = req.body.icona || 'noIco'; 

		await db.addElemento(nome, colore, icona);
		const allElementi = await db.getAllElementi(); 
		res.json(allElementi);
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.post('/NEWgiorno', async (req, res) => {
	try {
		const data = req.body.data || 'noData'; 
		const elementIdentifier = req.body.identificatoreElemento || 'noElem'; 

		await db.addGiorno(data, elementIdentifier);
		const allGio = await db.getAllGiorni(); 
		res.json(allGio);
	} catch (err) {
		res.status(500).json({"results": "none"});
	}
});

app.use((req, res) => { 
	res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`); 
}); 
 
db.init()
	.then(() => { 
		app.listen(//53147, () => console.log('The server is up and running...')); 
				PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	}) 
	.catch(err => { 
		console.log('Problem setting up the database'); 
		console.log(err); 
	});
// Gestione della chiusura del processo per disconnettersi da MongoDB
process.on('SIGINT', async () => {
	console.log('Chiusura del server...');
	await db.close();
	process.exit(0);
});