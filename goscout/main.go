package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

// run struct
type run struct {
	Event                 string `gorm:"type:varchar(100); not null; primary_key"`
	TeamNumber            uint16 `gorm:"type:smallint; not null; primary_key"`
	MatchNumber           uint8  `gorm:"type:smallint; not null; primary_key"`
	StartPosition         string `gorm:"type:varchar(100)"`
	AutoMovementLine      bool   `gorm:"type:boolean"`
	AutoSwitchCubes       uint8  `gorm:"type:tinyint"`
	AutoScaleCubes        uint8  `gorm:"type:tinyint"`
	FailedAutoSwitchCubes uint8  `gorm:"type:tinyint"`
	FailedAutoScaleCubes  uint8  `gorm:"type:tinyint"`
	AutoExchange          uint8  `gorm:"type:tinyint"`
	TeleSwitchCubes       uint8  `gorm:"type:tinyint"`
	TeleScaleCubes        uint8  `gorm:"type:tinyint"`
	FailedTeleSwitchCubes uint8  `gorm:"type:tinyint"`
	FailedTeleScaleCubes  uint8  `gorm:"type:tinyint"`
	TeleExchange          uint8  `gorm:"type:tinyint"`
	EndPosition           string `gorm:"type:varchar(100)"`
	YellowCards           uint8  `gorm:"type:tinyint"`
	RedCards              uint8  `gorm:"type:tinyint"`
	Notes                 string `gorm:"type:text(65535)"`
	Scouter               string `gorm:"type:varchar(100); primary_key"`
	Timestamp             string `gorm:"type:datetime; not null"`
}

var server string

func main() {
	server = os.Getenv("GOSCOUT_SQL_USER") + ":" + os.Getenv("GOSCOUT_SQL_PASSWD") + "@tcp(" + os.Getenv("GOSCOUT_SQL_HOST") + ")/strangescout"
	initDB()
	startAPI()
}

// initialize the database
func initDB() {
	// connect to DB
	db, err := gorm.Open("mysql", server)
	if err != nil {
		log.Fatal("failed to connect database: " + err.Error())
	}
	defer db.Close()

	// apply schema to DB
	db.AutoMigrate(&run{})
}

func startAPI() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.GET("/version", version)
	e.PUT("/:team/:match", submitRun)
	e.PUT("/:event/:team/:match", submitRun)

	// Start server
	e.Logger.Fatal(e.Start(":15338"))
}

func version(c echo.Context) error {
	// return API version
	return c.String(http.StatusOK, "GoScout API v1.0.0a")
}

func submitRun(c echo.Context) error {
	data := &run{}

	// set data from request body
	if err := c.Bind(data); err != nil {
		return err
	}

	// set data from request URL
	team, _ := strconv.Atoi(c.Param("team"))
	match, _ := strconv.Atoi(c.Param("match"))
	data.TeamNumber = uint16(team)
	data.MatchNumber = uint8(match)

	// if request has an event, set the event
	if c.Param("event") != "" {
		data.Event = c.Param("event")
	} else {
		// use the env variable if the event is not in the URL
		if _, b := os.LookupEnv("GOSCOUT_EVENT_HARDCODE"); b == true {
			data.Event = os.Getenv("GOSCOUT_EVENT_HARDCODE")
		}
	}

	// connect to database
	db, err := gorm.Open("mysql", server)
	if err != nil {
		log.Fatal("failed to connect database: " + err.Error())
	}
	defer db.Close()

	// create record
	if err := db.Create(data).Error; err != nil {
		// error handling
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return c.String(409, "This data duplicated an existing record. If you are trying to submit this data for the first time, your client has generateted multiple requests and your data has been safely recored. If you need to correct or delete previously entered data, please inform your system administrator.")
		}
		return c.String(500, "The StrangeScout database server returned an unhandled error. Please contact your system adminstrator and provide them with the following: "+err.Error())
	}

	return c.String(201, "Data successfully recorded! Thank you for using the StrangeScout system.")
}
