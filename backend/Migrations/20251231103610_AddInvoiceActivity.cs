using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceActivity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InvoiceActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InvoiceId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    PerformedById = table.Column<int>(type: "integer", nullable: false),
                    PerformedByUsername = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PerformedByRole = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Metadata = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceActivities_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceActivities_Users_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 31, 10, 36, 10, 418, DateTimeKind.Utc).AddTicks(900));

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceActivities_InvoiceId",
                table: "InvoiceActivities",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceActivities_PerformedById",
                table: "InvoiceActivities",
                column: "PerformedById");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceActivities_Timestamp",
                table: "InvoiceActivities",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvoiceActivities");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 31, 9, 43, 9, 42, DateTimeKind.Utc).AddTicks(3955));
        }
    }
}
